export type Product = {
  id: string
  name: string
  price: number
  image: string
}

const base = import.meta.env.BASE_URL

export const products: Product[] = [
  {
    id: 'ban-phim-co',
    name: 'Bàn phím cơ',
    price: 1200000,
    image: `${base}images/ban-phim-co.svg`,
  },
  {
    id: 'chuot-khong-day',
    name: 'Chuột không dây',
    price: 450000,
    image: `${base}images/chuot-khong-day.svg`,
  },
  {
    id: 'tai-nghe-bluetooth',
    name: 'Tai nghe Bluetooth',
    price: 890000,
    image: `${base}images/tai-nghe-bluetooth.svg`,
  },
  { id: 'balo-laptop', name: 'Balo laptop', price: 650000, image: `${base}images/balo-laptop.svg` },
  {
    id: 'binh-giu-nhiet',
    name: 'Bình giữ nhiệt',
    price: 320000,
    image: `${base}images/binh-giu-nhiet.svg`,
  },
  { id: 'den-ban-led', name: 'Đèn bàn LED', price: 280000, image: `${base}images/den-ban-led.svg` },
]
