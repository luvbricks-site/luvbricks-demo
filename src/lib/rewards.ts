export function pointsForOrder(subtotalAfterBundle:number){
  return Math.floor(subtotalAfterBundle); // 1 pt per $1
}
export function canAccruePoints(user?: { id:string }){
  return Boolean(user); // registered + signed-in
}
