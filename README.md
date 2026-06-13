# SimpleShop

Demo web bán hàng dành cho việc học automation testing. Ứng dụng bao gồm trang đăng nhập, danh sách sản phẩm, giỏ hàng và checkout — không có backend, toàn bộ dữ liệu chạy phía client.

## Chạy ứng dụng

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

## Dành cho người học automation testing

- Hợp đồng testid đầy đủ: [specs/001-simpleshop-demo/contracts/ui-contract.md](specs/001-simpleshop-demo/contracts/ui-contract.md)
- Kịch bản kiểm thử end-to-end: [specs/001-simpleshop-demo/quickstart.md](specs/001-simpleshop-demo/quickstart.md)
- Chỉ dùng `getByTestId` hoặc accessible role/label — không dùng selector theo class CSS.
- Công cụ khuyến nghị: [Playwright](https://playwright.dev/) (`npm init playwright@latest`).

## Lệnh hữu ích

```bash
npm run lint       # kiểm tra lỗi ESLint
npm run format     # format code với Prettier
npm run build      # build production
npm run preview    # xem trước bản build
```
