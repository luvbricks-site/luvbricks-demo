import { getTierForPrice } from "./tiers";

export type CartItem = { id:string; set:number; name:string; msrp:number; qty:number };

export function calcBundleSavings(items:CartItem[]){
  const countByTier = new Map<number, number>();
  items.forEach(i=>{
    const t = getTierForPrice(i.msrp);
    countByTier.set(t, (countByTier.get(t) ?? 0) + i.qty);
  });

  const pctByTier = new Map<number, number>([
    [1, 0.06],[2, 0.08],[3, 0.10],[4, 0.11],[5, 0.13]
  ]);

  let savings = 0;
  countByTier.forEach((count, tier)=>{
    if (count >= 3) {
      const tierSubtotal = items
        .filter(i=>getTierForPrice(i.msrp)===tier)
        .reduce((s,i)=> s + i.msrp * i.qty, 0);
      savings += tierSubtotal * (pctByTier.get(tier) ?? 0);
    }
  });

  return { qualified: savings > 0, savings: Math.round(savings*100)/100 };
}
