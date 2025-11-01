export type Merch = {
  id: string;
  title: string;
  desc: string;
  price: number; // price in points
  img: string;
};

export const MERCH: Merch[] = [
  {
    id: "xiat-beanie",
    title: "XIAT Beanie",
    desc: "A cozy, embroidered beanie with XIAT logo.",
    price: 500,
    img: "https://picsum.photos/seed/beanie/600/400",
  },
  {
    id: "xiat-hoodie",
    title: "XIAT Hoodie",
    desc: "Soft unisex hoodie with a clean logo on the chest.",
    price: 1500,
    img: "https://picsum.photos/seed/hoodie/600/400",
  },
  {
    id: "xiat-tee",
    title: "XIAT T‑Shirt",
    desc: "100% cotton tee available in multiple colors.",
    price: 800,
    img: "https://picsum.photos/seed/tshirt/600/400",
  },
  {
    id: "xiat-mug",
    title: "XIAT Mug",
    desc: "Ceramic mug for your morning coffee.",
    price: 300,
    img: "https://picsum.photos/seed/mug/600/400",
  },
  {
    id: "xiat-sticker-pack",
    title: "Sticker Pack",
    desc: "A set of 8 high-quality vinyl stickers.",
    price: 150,
    img: "https://picsum.photos/seed/stickers/600/400",
  },
  {
    id: "xiat-notebook",
    title: "XIAT Notebook",
    desc: "A5 lined notebook with soft-touch cover.",
    price: 400,
    img: "https://picsum.photos/seed/notebook/600/400",
  },
];
