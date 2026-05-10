import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

    // =========================
    // DOCTORS
    // =========================
    await prisma.doctor.createMany({
        data: [
            {
                id: "1",
                name: "Dr. Sarah Wilson",
                specialty: "Cardiologist",
                rating: 4.9,
                image:
                    "https://images.unsplash.com/photo-1559839734-2b71f153678e?auto=format&fit=crop&q=80&w=200",
                experience: "12 years",
                fee: 1000,
            },
            {
                id: "2",
                name: "Dr. James Miller",
                specialty: "Neurologist",
                rating: 4.8,
                image:
                    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
                experience: "15 years",
                fee: 1200,
            },
            {
                id: "3",
                name: "Dr. Emily Chen",
                specialty: "Pediatrician",
                rating: 4.9,
                image:
                    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
                experience: "8 years",
                fee: 800,
            },
            {
                id: "4",
                name: "Dr. Michael Brown",
                specialty: "Orthopedic",
                rating: 4.7,
                image:
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
                experience: "10 years",
                fee: 1100,
            },
        ],
    });

    // =========================
    // MEDICINES
    // =========================
    await prisma.medicine.createMany({
        data: [
            {
                id: "1",
                name: "Paracetamol 500mg",
                price: 45,
                category: "Pain Relief",
                stock: 100,
                image:
                    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200",
            },
            {
                id: "2",
                name: "Amoxicillin 250mg",
                price: 120,
                category: "Antibiotics",
                stock: 50,
                image:
                    "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=200",
            },
            {
                id: "3",
                name: "Vitamin C 1000mg",
                price: 299,
                category: "Supplements",
                stock: 200,
                image:
                    "https://images.unsplash.com/photo-1616671285410-096739bc4672?auto=format&fit=crop&q=80&w=200",
            },
        ],
    });

    console.log("✅ Database Seeded Successfully");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });