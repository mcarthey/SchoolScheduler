const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Configuration
const XELLO_URL = 'https://educator.xello.world/course-guide/d15fff78-6def-4cc6-8ffc-ce1cd06fb4f7';
const OUTPUT_CSV = '../ohs-courses.csv';

/**
 * Scrapes Xello course data and exports to CSV
 * 
 * USAGE:
 * 1. npm install
 * 2. node scrape-xello.js
 * 3. When prompted, manually log in to Xello
 * 4. Script will scrape all courses and save to CSV
 */
async function scrapeXello() {
  console.log('?? Starting Xello Course Scraper...\n');

  // Launch browser with visible UI
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can log in
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // Step 1: Navigate to Xello
    console.log('?? Navigating to Xello...');
    await page.goto(XELLO_URL, { waitUntil: 'networkidle2' });

    // Step 2: Wait for manual login
    console.log('\n??  PLEASE LOG IN TO XELLO MANUALLY');
    console.log('    Once logged in and you see the course list, press ENTER here...\n');
    
    // Wait for user to press Enter
    await waitForEnter();

    console.log('\n?? Starting course scrape...\n');

    // Step 3: Wait for course list to load
    await page.waitForSelector('.courses__course', {
      timeout: 15000
    });

    console.log('? Course list loaded!\n');

    // Step 4: Scrape course data from Xello's actual HTML structure
    const courses = await page.evaluate(() => {
      const disciplines = document.querySelectorAll('.disciplines-and-courses__discipline');
      const results = [];

      disciplines.forEach(discipline => {
        try {
          // Get department name from discipline heading
          const departmentName = discipline.querySelector('.disciplines-and-courses__discipline-name')?.textContent?.trim() || 'General';

          // Get all courses within this discipline
          const courseRows = discipline.querySelectorAll('.courses__course');

          courseRows.forEach(row => {
            try {
              // Extract data from Xello's actual structure
              const titleElement = row.querySelector('.courses__course-title');
              const descElement = row.querySelector('.courses__course-description p');
              const creditElement = row.querySelector('.courses__course-credit');
              const gradeElement = row.querySelector('.courses__course-grade');
              const prereqElements = row.querySelectorAll('.courses__details-subsection .courses__list button');
              const notesElement = row.querySelector('.courses__details-subsection div:not(.courses__subheading)');

              // Parse course title and code (e.g., "Aviation Exploration (Skinny) - 70279S")
              const fullTitle = titleElement?.textContent?.trim() || '';
              const titleMatch = fullTitle.match(/^(.*?)\s*-\s*(\w+)$/);
              const courseName = titleMatch ? titleMatch[1].trim() : fullTitle;
              const courseCode = titleMatch ? titleMatch[2].trim() : '';

              // Extract prerequisites
              const prerequisites = Array.from(prereqElements)
                .map(btn => {
                  const prereqText = btn.textContent?.trim() || '';
                  const prereqMatch = prereqText.match(/\s*-\s*(\w+)$/);
                  return prereqMatch ? prereqMatch[1] : '';
                })
                .filter(code => code)
                .join(',');

              // Determine block type from course name
              const blockType = /\(Skinny\)/i.test(fullTitle) ? 'Skinny' : 'Block';

              // Determine duration from notes or default to Full Year
              const notes = notesElement?.textContent?.trim() || '';
              let duration = 'Full Year';
              if (/semester 1/i.test(notes)) duration = 'Semester 1';
              else if (/semester 2/i.test(notes)) duration = 'Semester 2';

              const course = {
                courseCode: courseCode,
                courseName: courseName,
                department: departmentName,
                description: descElement?.textContent?.trim() || '',
                credits: creditElement?.textContent?.trim() || '1.0',
                gradeLevels: gradeElement?.textContent?.trim().replace(/\s+/g, '') || '',
                prerequisites: prerequisites,
                blockType: blockType,
                duration: duration,
                notes: notes
              };

              // Only add if we got a valid course name
              if (course.courseName && course.courseCode) {
                results.push(course);
              }
            } catch (error) {
              console.error('Error parsing course:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing discipline:', error);
        }
      });

      return results;
    });

    console.log(`? Found ${courses.length} courses!\n`);

    if (courses.length === 0) {
      console.log('??  No courses found. The page selectors might need adjustment.');
      console.log('    Saving page HTML for debugging...\n');
      
      const html = await page.content();
      fs.writeFileSync('../xello-page.html', html);
      console.log('    Saved to xello-page.html for inspection\n');
    } else {
      // Step 5: Process and enhance data
      const processedCourses = courses.map(course => {
        // Determine if AP/Honors
        const isAdvanced = /AP|Advanced|Honors/i.test(course.courseName);
        
        // Parse credits
        const creditsMatch = course.credits.match(/[\d.]+/);
        const credits = creditsMatch ? creditsMatch[0] : '1.0';
        
        // Determine periods required (double-block for science labs)
        const periodsRequired = /Lab|Laboratory/i.test(course.courseName) ? '2' : '1';
        
        // Estimate workload
        const workloadLevel = isAdvanced ? '5' : '3';

        return {
          CourseCode: course.courseCode,
          CourseName: course.courseName,
          Department: course.department,
          Duration: course.duration,
          BlockType: course.blockType.includes('Skinny') ? 'Skinny' : 'Block',
          Credits: credits,
          GradeLevels: course.gradeLevels.replace(/\s+/g, ''),
          Prerequisites: course.prerequisites,
          IsAdvanced: isAdvanced ? 'true' : 'false',
          Description: course.description.replace(/"/g, '""'), // Escape quotes
          PeriodsRequired: periodsRequired,
          WorkloadLevel: workloadLevel
        };
      });

      // Step 6: Write to CSV
      const csvWriter = createCsvWriter({
        path: OUTPUT_CSV,
        header: [
          { id: 'CourseCode', title: 'CourseCode' },
          { id: 'CourseName', title: 'CourseName' },
          { id: 'Department', title: 'Department' },
          { id: 'Duration', title: 'Duration' },
          { id: 'BlockType', title: 'BlockType' },
          { id: 'Credits', title: 'Credits' },
          { id: 'GradeLevels', title: 'GradeLevels' },
          { id: 'Prerequisites', title: 'Prerequisites' },
          { id: 'IsAdvanced', title: 'IsAdvanced' },
          { id: 'Description', title: 'Description' },
          { id: 'PeriodsRequired', title: 'PeriodsRequired' },
          { id: 'WorkloadLevel', title: 'WorkloadLevel' }
        ]
      });

      await csvWriter.writeRecords(processedCourses);
      console.log(`?? Saved ${processedCourses.length} courses to ${OUTPUT_CSV}\n`);

      // Show sample
      console.log('?? Sample courses:');
      processedCourses.slice(0, 5).forEach(c => {
        console.log(`   - ${c.CourseName} (${c.CourseCode}) - ${c.Department} - ${c.Credits} cr`);
      });
      console.log('   ...\n');
    }

  } catch (error) {
    console.error('? Error:', error.message);
    
    // Take screenshot for debugging
    await page.screenshot({ path: '../xello-error.png' });
    console.log('   Screenshot saved to xello-error.png\n');
  } finally {
    console.log('?? Done! Closing browser...\n');
    await browser.close();
  }
}

// Helper function to wait for Enter key
function waitForEnter() {
  return new Promise(resolve => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', () => {
      readline.close();
      resolve();
    });
  });
}

// Run the scraper
scrapeXello().catch(console.error);
