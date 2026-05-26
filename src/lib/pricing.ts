import { getTierForPrice, type Tier } from "./tiers";

export type CartItem = { id:string; set:number; name:string; msrp:number; qty:number };

export function calcBundleSavings(items:CartItem[]){
  const countByTier = new Map<Tier, number>();
  items.forEach(i=>{
    const t = getTierForPrice(i.msrp);
    if (t === 0) return;
    countByTier.set(t, (countByTier.get(t) ?? 0) + i.qty);
  });

  const pctByTier = new Map<Tier, number>([
    [1, 0.08], [2, 0.06], [3, 0.05], [4, 0.03]
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

