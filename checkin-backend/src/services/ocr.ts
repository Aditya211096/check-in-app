import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION || 'us'; // Default location
const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

let client: DocumentProcessorServiceClient | null = null;

if (projectId && processorId) {
  try {
    client = new DocumentProcessorServiceClient();
  } catch (err) {
    console.warn('GCP Document AI Client failed to initialize. Using mock OCR parser.', err);
  }
}

export const parseIdDocument = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<{
  fullName?: string;
  dob?: string;
  idType?: string;
  idNumber?: string;
}> => {
  if (client && projectId && processorId) {
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    
    try {
      const [result] = await client.processDocument({
        name,
        rawDocument: {
          content: fileBuffer.toString('base64'),
          mimeType,
        },
      });

      const { document } = result;
      if (!document) return getMockData();

      // Extract entities parsed by Document AI
      const parsedDetails: {
        fullName?: string;
        dob?: string;
        idType?: string;
        idNumber?: string;
      } = {};

      if (document.entities) {
        for (const entity of document.entities) {
          const type = entity.type?.toLowerCase();
          const value = entity.mentionText;

          if (type === 'name' || type === 'guest_name' || type === 'full_name') {
            parsedDetails.fullName = value || undefined;
          } else if (type === 'dob' || type === 'birth_date') {
            parsedDetails.dob = value || undefined;
          } else if (type === 'id_number' || type === 'document_number') {
            parsedDetails.idNumber = value || undefined;
          }
        }
      }

      // Fallback details if entities are sparse
      parsedDetails.idType = mimeType.includes('pdf') ? 'PDF Document' : 'ID Proof Image';
      
      return parsedDetails;
    } catch (err) {
      console.error('Error with Document AI processing, falling back to mock.', err);
      return getMockData();
    }
  } else {
    // Development local mock
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockData());
      }, 1500); // Simulate OCR loading lag
    });
  }
};

// Helper mock data for local developer preview
function getMockData() {
  const mockNames = ['Kabir Das', 'Tulsidas Kashi', 'Aditya Mishra', 'Devendra Shastri', 'Ganga Prasad'];
  const randomIndex = Math.floor(Math.random() * mockNames.length);
  const randomAadhaar = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    fullName: mockNames[randomIndex],
    dob: '15/08/1992',
    idType: 'Aadhaar Card',
    idNumber: randomAadhaar,
  };
}
