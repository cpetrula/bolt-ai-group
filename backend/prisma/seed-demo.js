/**
 * Seed script for Demo Salon tenant
 * 
 * This script creates a demo tenant with:
 * - Demo Salon tenant with ACTIVE status
 * - Common salon services with pricing
 * - Demo employees (stylists) with schedules
 * - Employee-service relationships
 * - AI configuration
 * 
 * Usage: node prisma/seed-demo.js
 */

const { PrismaClient, TenantStatus } = require('@prisma/client');
const prisma = new PrismaClient();

// Demo phone number - this should match what's displayed on the home page
const DEMO_PHONE_NUMBER = '+15555551234';

const demoServices = [
  {
    name: "Women's Haircut",
    description: 'Professional haircut for women',
    basePrice: 75.00,
    durationMinutes: 60,
    addons: [
      { name: 'Deep Conditioning Treatment', price: 30.00, durationMinutes: 20 },
      { name: 'Olaplex Treatment', price: 40.00, durationMinutes: 20 },
    ],
  },
  {
    name: "Men's Haircut",
    description: 'Professional haircut for men',
    basePrice: 50.00,
    durationMinutes: 45,
    addons: [
      { name: 'Beard Trim', price: 15.00, durationMinutes: 15 },
    ],
  },
  {
    name: "Kids' Haircut",
    description: 'Haircut for children under 12',
    basePrice: 40.00,
    durationMinutes: 45,
    addons: [],
  },
  {
    name: 'Blowout',
    description: 'Professional styling and blow dry',
    basePrice: 60.00,
    durationMinutes: 45,
    addons: [],
  },
  {
    name: 'Full Color',
    description: 'Complete hair coloring service',
    basePrice: 150.00,
    durationMinutes: 120,
    addons: [
      { name: 'Deep Conditioning Treatment', price: 30.00, durationMinutes: 20 },
      { name: 'Olaplex Treatment', price: 40.00, durationMinutes: 20 },
    ],
  },
  {
    name: 'Root Touch-Up',
    description: 'Root color touch-up service',
    basePrice: 95.00,
    durationMinutes: 90,
    addons: [
      { name: 'Deep Conditioning Treatment', price: 30.00, durationMinutes: 20 },
    ],
  },
  {
    name: 'Partial Highlights',
    description: 'Partial hair highlighting service',
    basePrice: 160.00,
    durationMinutes: 120,
    addons: [
      { name: 'Deep Conditioning Treatment', price: 30.00, durationMinutes: 20 },
      { name: 'Olaplex Treatment', price: 40.00, durationMinutes: 20 },
    ],
  },
  {
    name: 'Full Highlights',
    description: 'Full hair highlighting service',
    basePrice: 220.00,
    durationMinutes: 150,
    addons: [
      { name: 'Deep Conditioning Treatment', price: 30.00, durationMinutes: 20 },
      { name: 'Olaplex Treatment', price: 40.00, durationMinutes: 20 },
    ],
  },
];

const demoEmployees = [
  {
    name: 'Sarah Johnson',
    role: 'Senior Stylist',
    phone: '+15555550101',
    email: 'sarah@demosalon.example.com',
    isActive: true,
    schedules: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
    ],
  },
  {
    name: 'Michael Chen',
    role: 'Stylist',
    phone: '+15555550102',
    email: 'michael@demosalon.example.com',
    isActive: true,
    schedules: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }, // Thursday
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }, // Friday
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' }, // Saturday
    ],
  },
  {
    name: 'Emily Rodriguez',
    role: 'Color Specialist',
    phone: '+15555550103',
    email: 'emily@demosalon.example.com',
    isActive: true,
    schedules: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }, // Monday
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }, // Thursday
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }, // Friday
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' }, // Saturday
    ],
  },
];

// AI configuration for demo tenant
const demoAIConfig = {
  greeting: "Hi, thanks for calling Demo Salon! I'm your virtual assistant. How can I help you today?",
  businessHours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '16:00' },
    sunday: { open: null, close: null }, // Closed
  },
  tone: 'friendly and professional',
  capabilities: [
    'Book appointments',
    'Check availability',
    'Provide pricing information',
    'Answer questions about services',
    'Cancel or modify appointments',
    'Check stylist schedules',
  ],
};

async function seedDemo() {
  console.log('Starting demo salon seed...');

  try {
    // Check if demo tenant already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { name: 'Demo Salon' },
          { twilioPhoneNumber: DEMO_PHONE_NUMBER },
        ],
      },
    });

    if (existingTenant) {
      console.log('Demo tenant already exists. Deleting existing demo tenant...');
      await prisma.tenant.delete({
        where: { id: existingTenant.id },
      });
      console.log('Existing demo tenant deleted.');
    }

    // Create demo tenant
    console.log('Creating demo tenant...');
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Salon',
        businessType: 'salon',
        status: TenantStatus.ACTIVE,
        twilioPhoneNumber: DEMO_PHONE_NUMBER,
        settings: demoAIConfig,
      },
    });
    console.log(`Demo tenant created: ${tenant.id}`);

    // Create services
    console.log('Creating demo services...');
    const createdServices = [];
    for (const serviceData of demoServices) {
      const service = await prisma.service.create({
        data: {
          tenantId: tenant.id,
          name: serviceData.name,
          description: serviceData.description,
          basePrice: serviceData.basePrice,
          durationMinutes: serviceData.durationMinutes,
          isActive: true,
          addons: {
            create: serviceData.addons.map((addon) => ({
              tenantId: tenant.id,
              name: addon.name,
              price: addon.price,
              durationMinutes: addon.durationMinutes,
            })),
          },
        },
        include: {
          addons: true,
        },
      });
      createdServices.push(service);
      console.log(`  Created service: ${service.name}`);
    }

    // Create employees with schedules
    console.log('Creating demo employees...');
    const createdEmployees = [];
    for (const employeeData of demoEmployees) {
      const employee = await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          name: employeeData.name,
          role: employeeData.role,
          phone: employeeData.phone,
          email: employeeData.email,
          isActive: employeeData.isActive,
          schedules: {
            create: employeeData.schedules.map((schedule) => ({
              tenantId: tenant.id,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            })),
          },
        },
        include: {
          schedules: true,
        },
      });
      createdEmployees.push(employee);
      console.log(`  Created employee: ${employee.name} (${employee.role})`);
    }

    // Assign services to employees
    console.log('Assigning services to employees...');
    
    // Sarah (Senior Stylist) - can do all services
    for (const service of createdServices) {
      await prisma.employeeService.create({
        data: {
          tenantId: tenant.id,
          employeeId: createdEmployees[0].id,
          serviceId: service.id,
        },
      });
    }
    console.log(`  Assigned all services to ${createdEmployees[0].name}`);

    // Michael (Stylist) - can do haircuts and blowouts
    const haircutAndBlowoutServices = createdServices.filter(s => 
      s.name.includes('Haircut') || s.name === 'Blowout'
    );
    for (const service of haircutAndBlowoutServices) {
      await prisma.employeeService.create({
        data: {
          tenantId: tenant.id,
          employeeId: createdEmployees[1].id,
          serviceId: service.id,
        },
      });
    }
    console.log(`  Assigned ${haircutAndBlowoutServices.length} services to ${createdEmployees[1].name}`);

    // Emily (Color Specialist) - can do color services and haircuts
    const colorServices = createdServices.filter(s => 
      s.name.includes('Color') || s.name.includes('Highlights') || s.name.includes("Women's Haircut")
    );
    for (const service of colorServices) {
      await prisma.employeeService.create({
        data: {
          tenantId: tenant.id,
          employeeId: createdEmployees[2].id,
          serviceId: service.id,
        },
      });
    }
    console.log(`  Assigned ${colorServices.length} services to ${createdEmployees[2].name}`);

    console.log('\n✅ Demo salon seed completed successfully!');
    console.log(`\nDemo Salon Details:`);
    console.log(`  Tenant ID: ${tenant.id}`);
    console.log(`  Name: ${tenant.name}`);
    console.log(`  Phone Number: ${tenant.twilioPhoneNumber}`);
    console.log(`  Services: ${createdServices.length}`);
    console.log(`  Employees: ${createdEmployees.length}`);
    console.log(`  Status: ${tenant.status}`);

  } catch (error) {
    console.error('Error seeding demo salon:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDemo()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
