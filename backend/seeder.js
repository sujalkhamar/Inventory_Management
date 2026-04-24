const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        // Clear database
        await User.deleteMany();
        await Product.deleteMany();
        await Sale.deleteMany();
        console.log('Database cleared...');

        // 1. Create Users (50 total)
        const users = [];
        // Add 1 guaranteed admin
        users.push({
            name: 'Admin User',
            email: 'admin@company.com',
            password: 'password123',
            role: 'admin'
        });
        
        for (let i = 1; i <= 49; i++) {
            users.push({
                name: `Employee ${i}`,
                email: `employee${i}@company.com`,
                password: 'password123',
                role: i < 15 ? 'worker' : 'staff' // 14 workers, rest staff
            });
        }

        const createdUsers = await User.create(users);
        console.log('50 Users Imported...');

        // 2. Create Products (60 total)
        const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Software', 'Breakroom'];
        const suppliers = ['TechCorp', 'Office Depot', 'IKEA', 'Microsoft', 'Costco'];
        const adjectives = ['Ergonomic', 'Wireless', 'Premium', 'Basic', 'Advanced', 'Portable'];
        const nouns = ['Keyboard', 'Monitor', 'Desk', 'Chair', 'Coffee Maker', 'Mouse', 'Headset'];
        
        const products = [];
        for (let i = 1; i <= 60; i++) {
            const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
            
            products.push({
                name: `${randomAdj} ${randomNoun} V${Math.floor(Math.random() * 10) + 1}`,
                stock: Math.floor(Math.random() * 200) + 5, // 5 to 204
                price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
                category: categories[Math.floor(Math.random() * categories.length)],
                supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
                lowStockThreshold: 20
            });
        }

        const createdProducts = await Product.create(products);
        console.log('60 Products Imported...');

        // 3. Create Sales (100 total)
        const sales = [];
        const workers = createdUsers.filter(u => u.role === 'worker' || u.role === 'admin');

        for (let i = 0; i < 100; i++) {
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const randomWorker = workers[Math.floor(Math.random() * workers.length)];
            const qty = Math.floor(Math.random() * 5) + 1;

            // Randomize dates over the last 30 days
            const randomPastDate = new Date();
            randomPastDate.setDate(randomPastDate.getDate() - Math.floor(Math.random() * 30));

            sales.push({
                product: randomProduct._id,
                quantity: qty,
                totalPrice: parseFloat((randomProduct.price * qty).toFixed(2)),
                soldBy: randomWorker._id,
                date: randomPastDate
            });
        }

        await Sale.create(sales);
        console.log('100 Sales Imported...');

        console.log('--- ALL DATA IMPORTED SUCCESSFULLY ---');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        await Sale.deleteMany();
        console.log('Data Destroyed...');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}
