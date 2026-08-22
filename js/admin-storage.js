import { supabase, requireAdmin } from './supabase-client.js';

const bucketByField = { thumbnail_url: 'portfolio-images', profile_photo_url: 'portfolio-images', certificate_url: 'certificates', image_url: 'gallery', logo_url: 'portfolio-images', document_url: 'certificates', resume_url: 'resume' };
const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const observer = new MutationObserver(() => {
  document.querySelectorAll('#form input[name]').forEach(input => {
    if (bucketByField[input.name] && !input.dataset.uploadReady) {
      input.dataset.uploadReady = 'true';
      const upload = document.createElement('input');
      upload.type = 'file'; upload.accept = allowed.join(','); upload.multiple = input.name === 'image_url';
      upload.setAttribute('aria-label', `Upload ${input.name.replaceAll('_', ' ')}`);
      input.insertAdjacentElement('afterend', upload);
      upload.addEventListener('change', () => uploadFiles(upload, input));
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });

async function uploadFiles(fileInput, target) {
  const session = await requireAdmin();
  if (!session) return;
  const files = [...fileInput.files];
  if (!files.length) return;
  if (files.some(file => !allowed.includes(file.type) || file.size > 10 * 1024 * 1024)) {
    alert('Use JPG, PNG, WEBP or PDF files under 10 MB.'); return;
  }
  const bucket = bucketByField[target.name];
  const urls = [];
  for (const file of files) {
    const path = `${session.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
    if (error) { alert(error.message); return; }
    urls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
  }
  target.value = urls.join(',');
  target.dispatchEvent(new Event('input', { bubbles: true }));
  const preview = document.createElement('img'); preview.src = urls[0]; preview.alt = 'Upload preview'; preview.style = 'max-width:180px;max-height:120px;object-fit:cover;display:block;margin-top:.5rem';
  fileInput.insertAdjacentElement('afterend', preview);
}
