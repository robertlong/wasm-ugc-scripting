import { Object3D, Vector3 } from "three";

const textDecoder = new TextDecoder();

enum EntityProperty {
  Position,
  Rotation,
  Scale,
}

export default class ScriptManager {
  private updateCallback?: (dt: number) => void;
  private nextEntityId: number = 0;
  private entityByName: Map<string, number> = new Map();
  private objects: Map<number, Object3D> = new Map();
  private memory: WebAssembly.Memory;
  private positions: Float32Array;
  private rotations: Float32Array;
  private scales: Float32Array;

  constructor(entityCount: number = 100) {
    this.memory = new WebAssembly.Memory({ initial: 1024, maximum: 1024 });
    this.positions = new Float32Array(this.memory.buffer, 0, entityCount);
    this.rotations = new Float32Array(this.memory.buffer, entityCount * 4, entityCount);
    this.scales = new Float32Array(this.memory.buffer, entityCount * 7, entityCount);
  }

  registerEntity(name: string, obj: Object3D) {
    const eid = this.nextEntityId;
    this.entityByName.set(name, eid);
    this.objects.set(eid, obj);
    this.nextEntityId++;
    obj.position.toArray(this.positions, eid * 3);
    obj.quaternion.toArray(this.rotations, eid * 4);
    obj.scale.toArray(this.scales, eid * 3);
  }

  async load(scriptUrl: string) {
    const position = new Float32Array(this.memory.buffer, 0, 4);
    position.set([1, 2, 3, 4]);

    const { instance } = await WebAssembly.instantiateStreaming(fetch(scriptUrl), {
      env: {
        memory: this.memory,
        getEntityByName: (ptr: number, len: number): number => {
          const name = textDecoder.decode(new Uint8Array(this.memory.buffer, ptr, len));
          const eid = this.entityByName.get(name);
          return eid === undefined ? -1 : eid;
        },
        getVec2Property: (eid: number, property: number): number => {
          return -1;
        },
        getVec3Property: (eid: number, property: number): number => {
          const entityOffset = eid * 3;

          switch (property) {
            case EntityProperty.Position:
              return this.positions.byteOffset + entityOffset;
            case EntityProperty.Scale:
              return this.scales.byteOffset + entityOffset;
            default:
              return -1;
          }
        },
        getVec4Property: (eid: number, property: number): number => {
          return -1;
        },
        getQuatProperty: (eid: number, property: number): number => {
          const entityOffset = eid * 4;

          switch (property) {
            case EntityProperty.Rotation:
              return this.rotations.byteOffset + entityOffset;
            default:
              return -1;
          }
        },
        updateProperty: (eid: number, property: number): void => {
          const obj = this.objects.get(eid);

          if (!obj) {
            return;
          }

          switch (property) {
            case EntityProperty.Position:
              obj.position.fromArray(this.positions, eid * 3);
              return;
            case EntityProperty.Rotation:
              obj.quaternion.fromArray(this.rotations, eid * 4);
              return;
            case EntityProperty.Scale:
              obj.scale.fromArray(this.scales, eid * 3);
              return;
            default:
              return;
          }
        }
      }
    });

    if (typeof instance.exports._start === "function") {
      instance.exports._start();
    }
  
    if (typeof instance.exports._initialize === "function") {
      instance.exports._initialize();
    }

    if (typeof instance.exports.update === "function") {
      this.updateCallback = instance.exports.update as (dt: number) => void;
    }
  }

  update(dt: number) {
    if (this.updateCallback) {
      this.updateCallback(dt);
    }
  }
}
