export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Camiseta 2W Classic",
    price: 89.90,
    originalPrice: 129.90,
    image: "/placeholder.svg",
    category: "camisetas",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco", "Azul"],
    description: "Camiseta clássica 2WL Store em algodão premium. Estampa exclusiva da marca.",
    isNew: true,
    isOnSale: true,
  },
  {
    id: "2",
    name: "Moletom 2W Street",
    price: 199.90,
    image: "/placeholder.svg",
    category: "moletons",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Cinza"],
    description: "Moletom oversized com capuz. Tecido pesado e acabamento premium.",
    isBestSeller: true,
  },
  {
    id: "3",
    name: "Calça Cargo 2W",
    price: 259.90,
    image: "/placeholder.svg",
    category: "calcas",
    sizes: ["38", "40", "42", "44"],
    colors: ["Preto", "Bege"],
    description: "Calça cargo com bolsos laterais. Visual urbano e moderno.",
    isNew: true,
  },
  {
    id: "4",
    name: "Short 2W Basic",
    price: 119.90,
    originalPrice: 149.90,
    image: "/placeholder.svg",
    category: "shorts",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Azul Marinho"],
    description: "Short básico com caimento perfeito. Ideal para o dia a dia.",
    isOnSale: true,
  },
  {
    id: "5",
    name: "Boné 2W Signature",
    price: 79.90,
    image: "/placeholder.svg",
    category: "acessorios",
    sizes: ["Único"],
    colors: ["Preto", "Azul"],
    description: "Boné com logo bordado. Aba curva e regulagem traseira.",
    isBestSeller: true,
  },
  {
    id: "6",
    name: "Camiseta 2W Oversized",
    price: 99.90,
    image: "/placeholder.svg",
    category: "camisetas",
    sizes: ["M", "G", "GG", "XG"],
    colors: ["Preto", "Branco", "Off-White"],
    description: "Camiseta oversized com fit largo. Estilo streetwear autêntico.",
    isNew: true,
  },
  {
    id: "7",
    name: "Moletom 2W Minimal",
    price: 179.90,
    image: "/placeholder.svg",
    category: "moletons",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco"],
    description: "Moletom minimalista sem estampa. Logo discreto no peito.",
    isBestSeller: true,
  },
  {
    id: "8",
    name: "Calça Jogger 2W",
    price: 189.90,
    originalPrice: 239.90,
    image: "/placeholder.svg",
    category: "calcas",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Cinza"],
    description: "Calça jogger com punho elástico. Conforto e estilo.",
    isOnSale: true,
  },
];

export const categories = [
  { id: "camisetas", name: "Camisetas", icon: "👕" },
  { id: "moletons", name: "Moletons", icon: "🧥" },
  { id: "calcas", name: "Calças", icon: "👖" },
  { id: "shorts", name: "Shorts", icon: "🩳" },
  { id: "acessorios", name: "Acessórios", icon: "🧢" },
];
