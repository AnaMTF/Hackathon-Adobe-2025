import { NextResponse } from 'next/server';
import Reward from '../../../models/reward-model';
import { sequelize } from '../../../../lib/database';
import { Op } from 'sequelize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: Array<{ id: string; qty: number }> = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 });
    }

    // Use a transaction to atomically check and decrement stock
    const result = await sequelize.transaction(async (t: any) => {
      for (const it of items) {
        const id = it.id;
        const qty = Number(it.qty) || 0;
        if (qty <= 0) throw new Error(`Invalid quantity for item ${id}`);

        const reward = await Reward.findOne({
          where: { [Op.or]: [{ slug: id }, { id: id }] },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!reward) throw new Error(`Reward not found: ${id}`);

        const stock = (reward as any).stock ?? 0;
        if (stock < qty) throw new Error(`Insufficient stock for ${reward.title || id}`);

        // decrement
        (reward as any).stock = stock - qty;
        await reward.save({ transaction: t });
      }

      return true;
    });

    return NextResponse.json({ success: true, data: { result } });
  } catch (err: any) {
    console.error('Checkout error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Checkout failed' }, { status: 500 });
  }
}
