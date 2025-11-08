import { calcBundleSavings, CartItem } from "./pricing";
import { canAccruePoints, pointsForOrder } from "./rewards";

export function summarizeCart(items:CartItem[], user?:{id:string}){
  const subtotal = items.reduce((s,i)=> s + i.msrp*i.qty, 0);
  const { qualified, savings } = calcBundleSavings(items);
  const total = subtotal - (qualified ? savings : 0);
  const points = canAccruePoints(user) ? pointsForOrder(total) : 0;
  return { subtotal, bundleDiscount: qualified ? savings : 0, total, points };
}
