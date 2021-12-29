import { getEntityByName, updateProperty, EntityProperty, getQuatProperty } from "./world";

const boxEid = getEntityByName("box");

export function update(dt: f32): void {
  const rotation = getQuatProperty(boxEid, EntityProperty.Rotation);
  rotation.rotateX(dt * 0.5);
  updateProperty(boxEid, EntityProperty.Rotation);
}
