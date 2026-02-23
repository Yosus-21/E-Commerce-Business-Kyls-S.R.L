require('dotenv').config();
const connectDB = require('../src/config/database');
const User = require('../src/models/User');

const createAdmin = async () => {
    try {
        await connectDB();

        // Verificar si ya existe
        const existing = await User.findOne({ email: 'admin@businesskyla.com' });
        if (existing) {
            console.log('❌ Admin ya existe');
            console.log('Email: admin@businesskyla.com');
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@businesskyla.com',
            password: 'admin123',
            phone: '77000000',
            role: 'admin'
        });

        console.log('✅ Admin creado exitosamente');
        console.log('Email:', admin.email);
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
