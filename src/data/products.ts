export type Product = {
  id: string
  name: string
  price: number
  image: string
}

export const products: Product[] = [
  { id: 'ban-phim-co', name: 'Bàn phím cơ', price: 1200000, image: '/images/ban-phim-co.svg' },
  {
    id: 'chuot-khong-day',
    name: 'Chuột không dây',
    price: 450000,
    image: '/images/chuot-khong-day.svg',
  },
  {
    id: 'tai-nghe-bluetooth',
    name: 'Tai nghe Bluetooth',
    price: 890000,
    image: '/images/tai-nghe-bluetooth.svg',
  },
  { id: 'balo-laptop', name: 'Balo laptop', price: 650000, image: '/images/balo-laptop.svg' },
  {
    id: 'binh-giu-nhiet',
    name: 'Bình giữ nhiệt',
    price: 320000,
    image: '/images/binh-giu-nhiet.svg',
  },
  { id: 'den-ban-led', name: 'Đèn bàn LED', price: 280000, image: '/images/den-ban-led.svg' },
]
