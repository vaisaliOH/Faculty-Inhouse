const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// --- Import ALL your models ---
const Faculty = require('./models/Faculty');
const Audit = require('./models/Audit'); // Use the correct model name
const Academia = require('./models/Academia');

// --- Configuration ---
const MONGO_URI = 'mongodb://127.0.0.1:27017/facultyAuditDB';
const ACADEMIA_CSV_PATH = path.join(__dirname, 'csv_data', 'academia.csv');
const FACULTIES_CSV_PATH = path.join(__dirname, 'csv_data', 'faculties.csv');
const AUDITS_CSV_PATH = path.join(__dirname, 'csv_data', 'audits.csv');

// Helper function to read a CSV file
const readCSV = (filePath) => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully.');

        // Clear all collections
        await Faculty.deleteMany({});
        await Audit.deleteMany({});
        await Academia.deleteMany({});
        console.log('🧹 Cleared existing collections.');

        // --- STAGE 1: Import Academia Data ---
        const academiaData = await readCSV(ACADEMIA_CSV_PATH);
        const academiaToInsert = [];
        for (const row of academiaData) {
            if (row['DAY ORDER'] && row['DAY ORDER'].trim() !== '') {
                academiaToInsert.push({
                    date: new Date(row.DATE),
                    day: row.DAY,
                    dayOrder: parseInt(row['DAY ORDER'])
                });
            }
        }
        await Academia.insertMany(academiaToInsert);
        console.log(`📚 Imported ${academiaToInsert.length} academia entries.`);
        
        // --- STAGE 2: Import Faculties ---
        const facultiesData = await readCSV(FACULTIES_CSV_PATH);
        const facultiesToInsert = facultiesData.map(row => ({
            facultyId: row.FacultyID, // Storing as String to match login logic
            name: row.Name,
            email: row.Email,
            password: 'defaultPassword123'
        }));
        await Faculty.insertMany(facultiesToInsert);
        console.log(`🧑‍🏫 Imported ${facultiesData.length} faculties.`);

        // --- STAGE 3: Import Audit Schedules (Corrected Logic) ---
        const auditsData = await readCSV(AUDITS_CSV_PATH);
        let createdAuditsCount = 0;

        for (const auditRule of auditsData) {
            const facultyDoc = await Faculty.findOne({ facultyId: auditRule['Faculty ID'] });
            if (!facultyDoc) {
                console.warn(`⚠️ Skipping schedule for unknown Faculty ID: ${auditRule['Faculty ID']}`);
                continue;
            }

            const dayOrderToMatch = parseInt(auditRule.DayOrder);
            const matchingAcademiaEntries = await Academia.find({ dayOrder: dayOrderToMatch });

            if (matchingAcademiaEntries.length === 0) {
                console.warn(`⚠️ No dates found for DayOrder: ${auditRule.DayOrder}`);
                continue;
            }
            
            const venuesArray = auditRule.Venue.split(',').map(v => v.trim());

            // Create a separate audit record for EACH date and EACH venue
            for (const academiaEntry of matchingAcademiaEntries) {
                for (const venue of venuesArray) {
                    // THE FIX IS HERE: We create an 'Audit' with the 'date' field
                    const newAudit = new Audit({
                        faculty: facultyDoc._id,
                        date: academiaEntry.date, // <-- THIS IS THE CRITICAL FIX
                        slot: auditRule.Slot.trim(),
                        roomNumber: venue
                    });
                    await newAudit.save();
                    createdAuditsCount++;
                }
            }
        }
        console.log(`🗓️  Created ${createdAuditsCount} individual audit records.`);

        console.log('\n🎉 Data import completed successfully!');

    } catch (error) {
        console.error('❌ An error occurred during the import process:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected.');
    }
};

importData();