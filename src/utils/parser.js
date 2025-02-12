// utils/parser.js

export const parsePcRequirements = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const listItems = doc.querySelectorAll('li');
  
    let processor = '';
    let graphics = '';
    let ram = 0;
  
    listItems.forEach(item => {
      const strong = item.querySelector('strong');
      const text = item.textContent;
  
      if (strong) {
        const key = strong.textContent.trim().replace(':', '').toLowerCase();
  
        if (key.includes('processor')) {
          // Extraer la frecuencia en GHz si está presente
          const freqMatch = text.match(/(\d+(\.\d+)?)\s*GHz/i);
          const freq = freqMatch ? parseFloat(freqMatch[1]) : 0;
          processor = text.replace(/<[^>]*>?/gm, '').replace(/Processor:/i, '').trim();
        }
  
        if (key.includes('graphics')) {
          graphics = text.replace(/<[^>]*>?/gm, '').replace(/Graphics:/i, '').trim();
        }
  
        if (key.includes('memory')) {
          const ramMatch = text.match(/(\d+)\s*GB/i);
          ram = ramMatch ? parseInt(ramMatch[1], 10) : 0;
        }
      }
    });
  
    return {
      processor,
      graphics,
      ram
    };
  };
  