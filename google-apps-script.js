/**
 * Google Apps Script for Contact Form
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Click "New Project"
 * 3. Replace the default code with this script
 * 4. Create a new Google Sheet (or use an existing one)
 * 5. Copy the Sheet ID from the URL (the long string between /d/ and /edit)
 * 6. Replace 'YOUR_SHEET_ID' below with your Sheet ID
 * 7. Replace 'stefanola@ru.is' with your email if different
 * 8. Click "Deploy" > "New deployment"
 * 9. Select type: "Web app"
 * 10. Set "Execute as" to "Me"
 * 11. Set "Who has access" to "Anyone"
 * 12. Click "Deploy"
 * 13. Copy the Web app URL and paste it into contact.html where it says YOUR_GOOGLE_APPS_SCRIPT_URL
 */

// Replace with your Google Sheet ID (found in the Sheet URL)
const SHEET_ID = '1cueDp3o6VDrohZjJ9WRaQkf54ArKCKUKx045wV3DjAc';

// Replace with your email address
const RECIPIENT_EMAIL = 'stefanola@ru.is';

// Handle GET requests (for testing/deployment verification)
function doGet(e) {
  return ContentService
    .createTextOutput('Contact form script is working! Use POST to submit form data.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    // Log the received data for debugging
    Logger.log('Received POST data: ' + JSON.stringify(e));
    Logger.log('Parameters: ' + JSON.stringify(e.parameter));
    
    // Parse URL-encoded form data (data is available in e.parameter)
    const data = {
      name: e.parameter.name || '',
      email: e.parameter.email || '',
      subject: e.parameter.subject || '',
      message: e.parameter.message || ''
    };
    
    // Check if Sheet ID is set
    if (SHEET_ID === 'SHEET_ID') {
      throw new Error('Please set your SHEET_ID in the script');
    }
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // If the sheet is empty, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Subject', 'Message']);
    }
    
    // Add the form data to the sheet
    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      data.name,
      data.email,
      data.subject,
      data.message
    ]);
    
    Logger.log('Data saved to sheet successfully');
    
    // Optional: Send an email notification
    try {
      const subject = 'New Contact Form Submission: ' + data.subject;
      const body = `You have received a new message from your contact form:\n\n` +
                   `Name: ${data.name}\n` +
                   `Email: ${data.email}\n` +
                   `Subject: ${data.subject}\n\n` +
                   `Message:\n${data.message}`;
      
      MailApp.sendEmail({
        to: RECIPIENT_EMAIL,
        subject: subject,
        body: body,
        replyTo: data.email
      });
      
      Logger.log('Email sent successfully');
    } catch (emailError) {
      Logger.log('Email error: ' + emailError.toString());
      // Don't fail the whole request if email fails
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        message: 'Check the script logs for more details'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
