import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const html = `
<!DOCTYPE html>
<html>
<body>
  <div class="product" data-id="1">
    <h2>Laptop Pro 15</h2>
    <div class="brand">TechCorp</div>
    <div class="price">$1,299.99</div>
    <div class="rating">4.5/5</div>
    <div class="stock">In Stock</div>
    <p>High-performance laptop with 15-inch display, 16GB RAM, and 512GB SSD</p>
  </div>
  <div class="product" data-id="2">
    <h2>Wireless Mouse Elite</h2>
    <div class="brand">PeripheralCo</div>
    <div class="price">$29.99</div>
    <div class="rating">4.8/5</div>
    <div class="stock">In Stock</div>
    <p>Ergonomic wireless mouse with precision tracking</p>
  </div>
  <div class="product" data-id="3">
    <h2>USB-C Hub Pro</h2>
    <div class="brand">ConnectTech</div>
    <div class="price">$49.99</div>
    <div class="rating">4.3/5</div>
    <div class="stock">Out of Stock</div>
    <p>7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader</p>
  </div>
</body>
</html>
`;

const res = await smartScraper(apiKey, {
	user_prompt: "Extract all products with name, brand, price, rating, and stock status",
	website_html: html,
});

if (res.status === "success") {
	console.log("Products:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
