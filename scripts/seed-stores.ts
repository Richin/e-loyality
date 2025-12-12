import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding stores...');

    const stores = [
        {
            name: 'Central Plaza Mall',
            address: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            latitude: 40.7505,
            longitude: -73.9934,
            phone: '+1 (212) 555-0123',
            email: 'nyc.central@eloyalty.com',
            openingHours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 7PM',
            imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=500',
        },
        {
            name: 'Westside Market',
            address: '456 West Ave',
            city: 'Los Angeles',
            postalCode: '90001',
            latitude: 34.0522,
            longitude: -118.2437,
            phone: '+1 (213) 555-0456',
            email: 'la.westside@eloyalty.com',
            openingHours: 'Daily: 8AM - 10PM',
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=500',
        },
        {
            name: 'Downtown Hub',
            address: '789 Python Blvd',
            city: 'Chicago',
            postalCode: '60601',
            latitude: 41.8781,
            longitude: -87.6298,
            phone: '+1 (312) 555-0789',
            email: 'chi.hub@eloyalty.com',
            openingHours: 'Mon-Fri: 9AM - 8PM, Sat-Sun: 10AM - 6PM',
            imageUrl: 'https://images.unsplash.com/photo-1604719312566-b7cb0463d3f4?auto=format&fit=crop&q=80&w=500',
        },
        {
            name: 'Tech Park Branch',
            address: '101 Silicon Way',
            city: 'San Francisco',
            postalCode: '94107',
            latitude: 37.7749,
            longitude: -122.4194,
            phone: '+1 (415) 555-0101',
            email: 'sf.tech@eloyalty.com',
            openingHours: 'Mon-Fri: 10AM - 7PM',
            imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=500',
        },
        {
            name: 'Suburban Outlet',
            address: '202 Green Lane',
            city: 'Austin',
            postalCode: '73301',
            latitude: 30.2672,
            longitude: -97.7431,
            phone: '+1 (512) 555-0202',
            email: 'austin.outlet@eloyalty.com',
            openingHours: 'Daily: 11AM - 8PM',
            imageUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=500',
        },
    ];

    for (const store of stores) {
        const existing = await prisma.store.findFirst({ where: { name: store.name } });
        if (!existing) {
            await prisma.store.create({ data: store });
            console.log(`Created store: ${store.name}`);
        } else {
            console.log(`Store already exists: ${store.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
