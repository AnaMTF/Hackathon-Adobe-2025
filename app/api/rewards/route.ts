import { NextResponse } from 'next/server';
import Reward from '../../models/reward-model';

export async function GET() {
  try {
    // Ensure table exists
    await Reward.sync();

    // Seed default merch if empty
    const count = await Reward.count();
    if (count === 0) {
      const seed = [
        {
          slug: 'hoodie',
          title: 'Company Hoodie',
          description: 'A warm, unisex hoodie embroidered with the company logo.',
          price: 1600,
          stock: 25,
          img: '/assets/hoodie.jpeg',
        },
        {
          slug: 'beanie',
          title: 'Cozy Beanie',
          description: 'Soft knit beanie to keep you warm on chilly days.',
          price: 450,
          stock: 40,
          img: '/assets/beanie.jpeg',
        },
        {
          slug: 'keyboard',
          title: 'Mechanical Keyboard',
          description: 'A compact mechanical keyboard with tactile switches.',
          price: 4200,
          stock: 10,
          img: '/assets/keyboard.jpeg',
        },
        {
          slug: 'mouse',
          title: 'Precision Mouse',
          description: 'High-DPI ergonomic mouse for long sessions.',
          price: 1800,
          stock: 20,
          img: '/assets/mouse.jpeg',
        },
        {
          slug: 'mug',
          title: 'Ceramic Mug',
          description: 'A sturdy ceramic mug for coffee and tea.',
          price: 350,
          stock: 60,
          img: '/assets/mug.jpeg',
        },
        {
          slug: 'mousepad',
          title: 'Large Mousepad',
          description: 'Smooth extended mousepad with non-slip base.',
          price: 400,
          stock: 30,
          img: '/assets/mousepad.jpeg',
        },
        {
          slug: 'stickers',
          title: 'Sticker Pack',
          description: 'A pack of assorted vinyl stickers.',
          price: 150,
          stock: 100,
          img: '/assets/stickers.jpeg',
        },
        {
          slug: 'tshirt',
          title: 'Company T‑Shirt',
          description: 'Comfortable cotton T‑shirt featuring a subtle logo.',
          price: 700,
          stock: 45,
          img: '/assets/tshirt.jpeg',
        },
      ];

      for (const item of seed) {
        try {
          // Check if reward with this slug already exists
          const existing = await Reward.findOne({ where: { slug: item.slug } });
          if (!existing) {
            await Reward.create({
              slug: item.slug,
              title: item.title,
              description: item.description,
              price: item.price,
              img: item.img,
              stock: item.stock,
            });
          }
        } catch (error) {
          // If it fails due to unique constraint, just continue
          console.log(`Reward ${item.slug} already exists, skipping...`, error instanceof Error ? error.message : error);
        }
      }
    }

    const rewards = await Reward.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json({ success: true, data: { rewards } });
  } catch (err) {
    console.error('Failed to fetch rewards', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch rewards' }, { status: 500 });
  }
}
