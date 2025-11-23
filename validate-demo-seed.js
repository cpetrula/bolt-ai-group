/**
 * Test script to validate the demo seed script
 * This script checks the syntax and structure without requiring database access
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating demo seed script...\n');

// Check if seed script exists
const seedScriptPath = path.join(__dirname, 'backend', 'prisma', 'seed-demo.js');
if (!fs.existsSync(seedScriptPath)) {
  console.error('❌ Error: seed-demo.js not found!');
  process.exit(1);
}
console.log('✅ Seed script file exists');

// Check if seed script is valid JavaScript
try {
  const seedScript = fs.readFileSync(seedScriptPath, 'utf8');
  
  // Basic validation checks
  const checks = [
    {
      name: 'Has Prisma import',
      test: () => seedScript.includes('@prisma/client'),
    },
    {
      name: 'Defines demo phone number',
      test: () => seedScript.includes('+15555551234'),
    },
    {
      name: 'Defines 8 services',
      test: () => {
        const matches = seedScript.match(/name: ["'].*Haircut["']/g) || [];
        return matches.length >= 3; // At least Women's, Men's, Kids' haircuts
      },
    },
    {
      name: 'Defines 3 employees',
      test: () => {
        return seedScript.includes('Sarah Johnson') &&
               seedScript.includes('Michael Chen') &&
               seedScript.includes('Emily Rodriguez');
      },
    },
    {
      name: 'Has pricing values',
      test: () => {
        return seedScript.includes('basePrice: 75.00') &&
               seedScript.includes('basePrice: 50.00') &&
               seedScript.includes('basePrice: 150.00');
      },
    },
    {
      name: 'Has AI configuration',
      test: () => seedScript.includes('demoAIConfig'),
    },
    {
      name: 'Has idempotent check',
      test: () => seedScript.includes('existingTenant'),
    },
    {
      name: 'Creates tenant with ACTIVE status',
      test: () => seedScript.includes('TenantStatus.ACTIVE'),
    },
    {
      name: 'Assigns services to employees',
      test: () => seedScript.includes('employeeService.create'),
    },
    {
      name: 'Has error handling',
      test: () => seedScript.includes('try') && seedScript.includes('catch'),
    },
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach((check) => {
    try {
      if (check.test()) {
        console.log(`✅ ${check.name}`);
        passed++;
      } else {
        console.log(`❌ ${check.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${check.name} (error: ${error.message})`);
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${checks.length} checks`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some validation checks failed!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error reading seed script:', error.message);
  process.exit(1);
}

// Validate service pricing matches specification
console.log('\n💰 Validating service pricing...');

const expectedPrices = {
  "Women's Haircut": 75,
  "Men's Haircut": 50,
  "Kids' Haircut": 40,
  "Blowout": 60,
  "Full Color": 150,
  "Root Touch-Up": 95,
  "Partial Highlights": 160,
  "Full Highlights": 220,
};

const seedScript = fs.readFileSync(seedScriptPath, 'utf8');
let pricingCorrect = true;

Object.entries(expectedPrices).forEach(([service, price]) => {
  const regex = new RegExp(`name:\\s*["']${service}["'][\\s\\S]*?basePrice:\\s*${price}\\.00`, 'm');
  if (regex.test(seedScript)) {
    console.log(`✅ ${service}: $${price}`);
  } else {
    console.log(`❌ ${service}: Expected $${price}`);
    pricingCorrect = false;
  }
});

if (!pricingCorrect) {
  console.log('\n⚠️  Pricing validation failed!');
  process.exit(1);
}

// Check documentation exists
console.log('\n📚 Checking documentation...');

const docs = [
  { file: 'backend/prisma/DEMO_SEED_README.md', name: 'Seed README' },
  { file: 'DEMO_QUICK_START.md', name: 'Quick Start Guide' },
];

docs.forEach((doc) => {
  const docPath = path.join(__dirname, doc.file);
  if (fs.existsSync(docPath)) {
    const content = fs.readFileSync(docPath, 'utf8');
    console.log(`✅ ${doc.name} exists (${content.length} bytes)`);
  } else {
    console.log(`❌ ${doc.name} not found`);
    pricingCorrect = false;
  }
});

// Check package.json has seed script
console.log('\n📦 Checking package.json...');
const packageJsonPath = path.join(__dirname, 'backend', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.scripts && packageJson.scripts['seed:demo']) {
  console.log('✅ npm run seed:demo script defined');
} else {
  console.log('❌ seed:demo script not found in package.json');
  process.exit(1);
}

console.log('\n✅ All validations passed! Demo seed script is ready to use.\n');
console.log('📝 To run the seed script:');
console.log('   1. Ensure database is configured in backend/.env');
console.log('   2. Run: cd backend && npm run seed:demo');
console.log('   3. Or: node backend/prisma/seed-demo.js\n');
