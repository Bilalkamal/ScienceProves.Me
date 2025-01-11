export const getLoaderStateIndex = (apiStatus: string): number => {
  console.log('API Status:', apiStatus);
  if (!apiStatus || apiStatus === '') return 0;
  
  if (apiStatus.includes("Validating")) return 1;
  if (apiStatus.includes("Searching") || apiStatus.includes("Searching scientific database for relevant papers...") || apiStatus.includes("Searching the web for scientific answers...")) return 2;
  if (apiStatus.includes("Analyzing") || apiStatus.includes("Re-ranking")) return 3;
  if (apiStatus.includes("Preparing") || apiStatus.includes("Generating")) return 4;
  if (apiStatus.includes("Verifying") || apiStatus.includes("Verifying answer accuracy and scientific validity...")) return 5;
  if (apiStatus.includes("Finalizing") || apiStatus.includes("completed") || apiStatus.includes("Request completed successfully")) return 6;
  return 0;
}; 