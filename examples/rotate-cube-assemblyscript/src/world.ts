export enum EntityProperty {
  Position,
  Rotation,
  Scale,
}

// @ts-ignore: decorator
@unmanaged
class Vector2 {
  x: f32 = 0;
  y: f32 = 0;
}

// @ts-ignore: decorator
@unmanaged
class Vector3 {
  x: f32 = 0;
  y: f32 = 0;
  z: f32 = 0;
}

// @ts-ignore: decorator
@unmanaged
class Vector4 {
  x: f32 = 0;
  y: f32 = 0;
  z: f32 = 0;
  w: f32 = 0;
}

// @ts-ignore: decorator
@unmanaged
class Quaternion {
  x: f32 = 0;
  y: f32 = 0;
  z: f32 = 0;
  w: f32 = 0;

  rotateX(rad: f32): this {
    const amount = rad * 0.5;

    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;

    const bx = Mathf.sin(amount);
    const bw = Mathf.cos(amount);

    this.x = ax * bw + aw * bx;
    this.y = ay * bw + az * bx;
    this.z = az * bw - ay * bx;
    this.w = aw * bw - ax * bx;

    return this;
  }
}

// @ts-ignore: decorator
@external("env", "getEntityByName")
declare function _getEntityByName(ptr: usize, len: usize): i32;

export function getEntityByName(name: string): i32 {
  const nameBuffer = String.UTF8.encode(name);
  const len = nameBuffer.byteLength;
  const ptr = changetype<usize>(nameBuffer);
  return _getEntityByName(ptr, len);
}

// @ts-ignore: decorator
@external("env", "getVec2Property")
declare function _getVec2Property(eid: i32, property: EntityProperty): usize;

export function getVec2Property(eid: i32, property: EntityProperty): Vector2 {
  const ptr = _getVec2Property(eid, property);
  return changetype<Vector2>(ptr);
}

// @ts-ignore: decorator
@external("env", "getVec3Property")
declare function _getVec3Property(eid: i32, property: EntityProperty): usize;

export function getVec3Property(eid: i32, property: EntityProperty): Vector3 {
  const ptr = _getVec3Property(eid, property);
  return changetype<Vector3>(ptr);
}

// @ts-ignore: decorator
@external("env", "getVec4Property")
declare function _getVec4Property(eid: i32, property: EntityProperty): usize;

export function getVec4Property(eid: i32, property: EntityProperty): Vector4 {
  const ptr = _getVec4Property(eid, property);
  return changetype<Vector4>(ptr);
}

// @ts-ignore: decorator
@external("env", "getQuatProperty")
declare function _getQuatProperty(eid: i32, property: EntityProperty): usize;

export function getQuatProperty(eid: i32, property: EntityProperty): Quaternion {
  const ptr = _getQuatProperty(eid, property);
  return changetype<Quaternion>(ptr);
}

// @ts-ignore: decorator
@external("env", "updateProperty")
export declare function updateProperty(eid: i32, property: EntityProperty): void;
