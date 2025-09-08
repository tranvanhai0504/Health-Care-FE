const fs = require('fs');

// Fix en.json
try {
  let enContent = fs.readFileSync('src/locales/en.json', 'utf8');
  
  // Find metadata section and rebuild it properly
  const metadataIndex = enContent.indexOf('"metadata"');
  if (metadataIndex > 0) {
    const beforeMetadata = enContent.substring(0, metadataIndex);
    console.log('Last 50 chars before metadata:', JSON.stringify(beforeMetadata.slice(-50)));
    
    // Check if the previous section ends properly with comma
    let correctedBeforeMetadata = beforeMetadata.trim();
    if (!correctedBeforeMetadata.endsWith(',')) {
      correctedBeforeMetadata += ',';
    }
    
    const metadata = {
      "title": "Health Care Solutions | Modern Healthcare Services",
      "description": "Providing quality healthcare services to improve your wellbeing and quality of life. Book schedules, consult with specialists, and access personalized care.",
      "keywords": [
        "healthcare",
        "medical care", 
        "doctor schedules",
        "healthcare solutions",
        "wellness",
        "health packages"
      ],
      "openGraph": {
        "title": "Health Care Solutions | Modern Healthcare Services",
        "description": "Providing quality healthcare services to improve your wellbeing and quality of life.",
        "siteName": "Health Care Solutions"
      }
    };
    
    const fullContent = correctedBeforeMetadata + '\n  "metadata": ' + JSON.stringify(metadata, null, 2).replace(/\n/g, '\n  ') + '\n}';
    
    // Validate JSON
    JSON.parse(fullContent);
    
    fs.writeFileSync('src/locales/en.json', fullContent);
    console.log('✅ Fixed en.json');
  }
} catch (e) {
  console.log('❌ Error fixing en.json:', e.message);
}

// Fix vi.json
try {
  let viContent = fs.readFileSync('src/locales/vi.json', 'utf8');
  
  // Find metadata section and rebuild it properly  
  const metadataIndex = viContent.indexOf('"metadata"');
  if (metadataIndex > 0) {
    const beforeMetadata = viContent.substring(0, metadataIndex);
    
    const metadata = {
      "title": "Giải pháp chăm sóc sức khỏe | Dịch vụ y tế hiện đại",
      "description": "Cung cấp dịch vụ chăm sóc sức khỏe chất lượng để cải thiện sức khỏe và chất lượng cuộc sống của bạn. Đặt lịch hẹn, tư vấn với chuyên gia và tiếp cận chăm sóc cá nhân hóa.",
      "keywords": [
        "chăm sóc sức khỏe",
        "dịch vụ y tế",
        "lịch hẹn bác sĩ",
        "giải pháp chăm sóc sức khỏe",
        "sức khỏe",
        "gói sức khỏe"
      ],
      "openGraph": {
        "title": "Giải pháp chăm sóc sức khỏe | Dịch vụ y tế hiện đại",
        "description": "Cung cấp dịch vụ chăm sóc sức khỏe chất lượng để cải thiện sức khỏe và chất lượng cuộc sống của bạn.",
        "siteName": "Giải pháp chăm sóc sức khỏe"
      }
    };
    
    const fullContent = beforeMetadata + '"metadata": ' + JSON.stringify(metadata, null, 2) + '\n}';
    
    // Validate JSON
    JSON.parse(fullContent);
    
    fs.writeFileSync('src/locales/vi.json', fullContent);
    console.log('✅ Fixed vi.json');
  }
} catch (e) {
  console.log('❌ Error fixing vi.json:', e.message);
}