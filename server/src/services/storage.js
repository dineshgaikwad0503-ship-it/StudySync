// Storage abstraction.
// Demo mode uses local disk through the resources route.
// Production: replace this adapter with AWS SDK S3 PutObject/GetObject + signed URLs.
// Keep AWS secrets only in server environment variables.
async function uploadToS3(){ throw new Error('Configure S3 adapter for production'); }
module.exports={uploadToS3};
