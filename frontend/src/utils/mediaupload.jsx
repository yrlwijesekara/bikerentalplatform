const supabaseUrl = 'https://ztxgzbdttejsjsipqfle.supabase.co';
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eGd6YmR0dGVqc2pzaXBxZmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTg0NjAsImV4cCI6MjA4MzI3NDQ2MH0.KivmUbuML4nDfI84Moi_Pj92XiCrXYnj28P7VM_QI4o";

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, key);
export default function MediaUpload(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("Please select a file first");
            return;
        }
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}-${file.name}`;
        supabase.storage.from('bikes').upload(fileName, file, { cacheControl: '3600', upsert: false })
            .then((response) => {
                if (response.error) {
                    reject("Error uploading file: " + response.error.message);
                } else {
                    const publicUrl = supabase.storage.from('bikes').getPublicUrl(fileName).data.publicUrl;
                    resolve(publicUrl);
                }
            })
            .catch((error) => {
                reject("Error uploading file: " + error.message);
            });
    });
}



