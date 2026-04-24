const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const Product = require('./models/Product');
const User = require('./models/User');
const Sale = require('./models/Sale');
const Supplier = require('./models/Supplier');
const Activity = require('./models/Activity');
const Warehouse = require('./models/Warehouse');
const PurchaseOrder = require('./models/PurchaseOrder');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for MASSIVE seeding...');

        await Product.deleteMany();
        await User.deleteMany();
        await Sale.deleteMany();
        await Supplier.deleteMany();
        await Activity.deleteMany();
        await Warehouse.deleteMany();
        await PurchaseOrder.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Warehouses
        console.log('Creating 5 Warehouses...');
        const warehouses = await Warehouse.insertMany([
            { name: 'NYC Central Hub', location: 'New York, NY', manager: 'James Wilson', capacity: 5000 },
            { name: 'LA Distribution', location: 'Los Angeles, CA', manager: 'Maria Garcia', capacity: 8000 },
            { name: 'Chicago Depot', location: 'Chicago, IL', manager: 'Robert Chen', capacity: 3000 },
            { name: 'Miami Storage', location: 'Miami, FL', manager: 'Sofia Perez', capacity: 4000 },
            { name: 'Seattle Fulfillment', location: 'Seattle, WA', manager: 'David Kim', capacity: 6000 }
        ]);

        // 2. Suppliers
        console.log('Creating 20 Suppliers...');
        const supplierData = [
            { name: 'Global Tech Solutions', contactPerson: 'John Smith', email: 'john@globaltech.com', phone: '555-0101', category: 'Electronics', address: '100 Tech Ave, San Jose, CA' },
            { name: 'Fast Logistics Inc', contactPerson: 'Lisa Brown', email: 'lisa@fastlogistics.com', phone: '555-0102', category: 'Shipping', address: '200 Harbor Blvd, Long Beach, CA' },
            { name: 'Office Max Pro', contactPerson: 'Mike Davis', email: 'mike@officemax.com', phone: '555-0103', category: 'Stationery', address: '50 Paper Rd, Portland, OR' },
            { name: 'Furniture Kings', contactPerson: 'Sarah Lee', email: 'sarah@furniturekings.com', phone: '555-0104', category: 'Furniture', address: '75 Oak St, Nashville, TN' },
            { name: 'Chipset Solutions', contactPerson: 'Tom Wang', email: 'tom@chipset.com', phone: '555-0105', category: 'Electronics', address: '300 Silicon Way, Austin, TX' },
            { name: 'Display World', contactPerson: 'Anna Moore', email: 'anna@displayworld.com', phone: '555-0106', category: 'Electronics', address: '45 Screen Blvd, Denver, CO' },
            { name: 'Power Grid Supply', contactPerson: 'Chris Taylor', email: 'chris@powergrid.com', phone: '555-0107', category: 'Electronics', address: '88 Volt Ave, Phoenix, AZ' },
            { name: 'Cable Co International', contactPerson: 'Diana Ross', email: 'diana@cableco.com', phone: '555-0108', category: 'Accessories', address: '12 Wire Lane, Dallas, TX' },
            { name: 'Desk Masters', contactPerson: 'Frank Miller', email: 'frank@deskmasters.com', phone: '555-0109', category: 'Furniture', address: '99 Wood Dr, Atlanta, GA' },
            { name: 'Ergo Systems', contactPerson: 'Grace Park', email: 'grace@ergosystems.com', phone: '555-0110', category: 'Furniture', address: '20 Comfort Ave, Boston, MA' },
            { name: 'Network Plus', contactPerson: 'Henry Ford', email: 'henry@networkplus.com', phone: '555-0111', category: 'Electronics', address: '150 Router Rd, Detroit, MI' },
            { name: 'Storage Pro', contactPerson: 'Iris Chang', email: 'iris@storagepro.com', phone: '555-0112', category: 'Electronics', address: '60 Memory Ln, San Diego, CA' },
            { name: 'Audio Tech Ltd', contactPerson: 'Jake White', email: 'jake@audiotech.com', phone: '555-0113', category: 'Electronics', address: '33 Sound St, Nashville, TN' },
            { name: 'Printer Mart', contactPerson: 'Karen Black', email: 'karen@printermart.com', phone: '555-0114', category: 'Electronics', address: '77 Ink Blvd, Minneapolis, MN' },
            { name: 'Scan Experts', contactPerson: 'Leo Nguyen', email: 'leo@scanexperts.com', phone: '555-0115', category: 'Electronics', address: '44 Laser Ave, Columbus, OH' },
            { name: 'Security First', contactPerson: 'Mia Clark', email: 'mia@securityfirst.com', phone: '555-0116', category: 'Software', address: '200 Safe Way, Washington, DC' },
            { name: 'Mobile Hub', contactPerson: 'Nick Adams', email: 'nick@mobilehub.com', phone: '555-0117', category: 'Electronics', address: '55 Phone Dr, San Francisco, CA' },
            { name: 'Tablet Corp', contactPerson: 'Olivia Stone', email: 'olivia@tabletcorp.com', phone: '555-0118', category: 'Electronics', address: '30 Pad St, Cupertino, CA' },
            { name: 'Accessory Lab', contactPerson: 'Paul Green', email: 'paul@accessorylab.com', phone: '555-0119', category: 'Accessories', address: '10 Gadget Rd, Raleigh, NC' },
            { name: 'Cooling Systems', contactPerson: 'Quinn Hall', email: 'quinn@coolingsystems.com', phone: '555-0120', category: 'Electronics', address: '80 Fan Ave, Houston, TX' }
        ];
        const suppliers = await Supplier.insertMany(supplierData);

        // 3. Users (60)
        console.log('Creating 60 Users...');
        const firstNames = ['James','Emma','Liam','Olivia','Noah','Ava','William','Sophia','Benjamin','Isabella','Lucas','Mia','Henry','Charlotte','Alexander','Amelia','Daniel','Harper','Matthew','Evelyn','Jack','Abigail','Samuel','Emily','Sebastian','Elizabeth','Aiden','Sofia','Owen','Avery','Ethan','Ella','Ryan','Scarlett','Nathan','Grace','Caleb','Chloe','Dylan','Lily'];
        const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Anderson','Taylor','Thomas','Hernandez','Moore','Martin','Jackson','Thompson','White','Lopez','Lee','Gonzalez','Harris','Clark','Lewis','Robinson','Walker','Perez','Hall','Young'];

        const usersData = [
            { name: 'Admin User', email: 'admin@company.com', password: hashedPassword, role: 'admin' }
        ];
        for (let i = 1; i < 60; i++) {
            const fn = firstNames[i % firstNames.length];
            const ln = lastNames[i % lastNames.length];
            const role = i < 5 ? 'admin' : (i < 35 ? 'worker' : 'staff');
            usersData.push({
                name: `${fn} ${ln}`,
                email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@company.com`,
                password: hashedPassword,
                role
            });
        }
        const users = await User.insertMany(usersData);

        // 4. Products (350)
        console.log('Creating 350 Products...');
        const productBase = {
            Electronics: ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Webcam', 'Headset', 'Speaker', 'Router', 'SSD', 'RAM Module', 'GPU', 'CPU', 'Tablet', 'Smartphone', 'Charger'],
            Furniture: ['Office Chair', 'Standing Desk', 'Bookshelf', 'Filing Cabinet', 'Conference Table', 'Sofa', 'Footrest', 'Lamp'],
            Stationery: ['Notebook', 'Pen Set', 'Whiteboard', 'Marker Pack', 'Sticky Notes', 'Paper Ream', 'Folder Set', 'Binder'],
            Software: ['Antivirus License', 'Office Suite', 'Cloud Storage Plan', 'VPN Subscription', 'Design Tool'],
            Accessories: ['USB Hub', 'HDMI Cable', 'Laptop Stand', 'Mousepad', 'Wrist Rest', 'Screen Protector', 'Phone Case', 'Power Bank']
        };
        const brands = ['Pro', 'Ultra', 'Max', 'Lite', 'Elite', 'Prime', 'Core', 'X', 'Plus', 'Air'];
        const categories = Object.keys(productBase);
        const productsData = [];

        for (let i = 1; i <= 350; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const items = productBase[cat];
            const item = items[Math.floor(Math.random() * items.length)];
            const brand = brands[Math.floor(Math.random() * brands.length)];
            const costPrice = Math.floor(Math.random() * 800) + 5;
            const margin = 1.25 + Math.random() * 0.75; // 25%-100% margin
            const price = parseFloat((costPrice * margin).toFixed(2));

            productsData.push({
                name: `${item} ${brand} ${i}`,
                category: cat,
                stock: Math.floor(Math.random() * 300) + 5,
                price,
                costPrice,
                supplier: suppliers[Math.floor(Math.random() * suppliers.length)].name,
                warehouse: warehouses[Math.floor(Math.random() * warehouses.length)]._id,
                location: `Aisle ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}-${Math.floor(Math.random() * 50) + 1}`,
                lowStockThreshold: Math.floor(Math.random() * 20) + 5
            });
        }
        const products = await Product.insertMany(productsData);

        // 5. Sales (550, profitable)
        console.log('Creating 550+ Sales...');
        const salesData = [];
        const workers = users.filter(u => u.role === 'worker');

        for (let i = 0; i < 550; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            const discountRate = Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0;
            const taxRate = Math.random() < 0.7 ? 18 : 0; // GST
            const subtotal = product.price * quantity;
            const discountAmt = subtotal * (discountRate / 100);
            const taxAmt = (subtotal - discountAmt) * (taxRate / 100);
            const totalPrice = subtotal - discountAmt + taxAmt;
            const profit = (totalPrice - taxAmt) - (product.costPrice * quantity);

            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            salesData.push({
                product: product._id,
                quantity,
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                tax: parseFloat(taxAmt.toFixed(2)),
                discount: parseFloat(discountAmt.toFixed(2)),
                profit: parseFloat(profit.toFixed(2)),
                soldBy: workers[Math.floor(Math.random() * workers.length)]._id,
                date
            });
        }
        await Sale.insertMany(salesData);

        // 6. Sample Purchase Orders
        console.log('Creating sample Purchase Orders...');
        await PurchaseOrder.insertMany([
            {
                orderId: 'PO-001',
                supplier: suppliers[0]._id,
                items: [
                    { product: products[0]._id, quantity: 50, costPrice: products[0].costPrice },
                    { product: products[1]._id, quantity: 30, costPrice: products[1].costPrice }
                ],
                totalCost: products[0].costPrice * 50 + products[1].costPrice * 30,
                status: 'Received',
                warehouse: warehouses[0]._id,
                createdBy: users[0]._id
            },
            {
                orderId: 'PO-002',
                supplier: suppliers[3]._id,
                items: [
                    { product: products[10]._id, quantity: 20, costPrice: products[10].costPrice }
                ],
                totalCost: products[10].costPrice * 20,
                status: 'Shipped',
                warehouse: warehouses[1]._id,
                createdBy: users[0]._id
            },
            {
                orderId: 'PO-003',
                supplier: suppliers[7]._id,
                items: [
                    { product: products[50]._id, quantity: 100, costPrice: products[50].costPrice },
                    { product: products[51]._id, quantity: 75, costPrice: products[51].costPrice }
                ],
                totalCost: products[50].costPrice * 100 + products[51].costPrice * 75,
                status: 'Pending',
                warehouse: warehouses[2]._id,
                createdBy: users[0]._id
            }
        ]);

        // 7. Activity
        await Activity.create({
            user: users[0]._id,
            action: 'System Seeded',
            details: '60 users, 20 suppliers, 5 warehouses, 350 products, 550 sales, 3 purchase orders created'
        });

        console.log('');
        console.log('========================================');
        console.log('  MASSIVE SEEDING COMPLETE! 💎🚀');
        console.log('========================================');
        console.log('  60 Users | 20 Suppliers | 5 Warehouses');
        console.log('  350 Products | 550 Sales | 3 POs');
        console.log('  Login: admin@company.com / password123');
        console.log('========================================');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
