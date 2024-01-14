function getUniqueAudiosByType(obj) {
  const uniqueAudiosByType = {
    Sfx: new Set(),
    Music: new Set(),
    Script: new Set()
  };

  function traverse(target) {
    if(!target) return;
    if (Array.isArray(target)) {
      target.forEach(item => traverse(item));
    } else if (typeof target === 'object') {
      if (target.audios) {
        Object.entries(target.audios).forEach(([type, audioArray]) => {
          if (Array.isArray(audioArray)) {
            audioArray.forEach(audio => uniqueAudiosByType[type].add(audio));
          }
        });
      }
      Object.values(target).forEach(value => traverse(value));
    }
  }

  traverse(obj);

  // Convert sets to arrays for each type
  for (const type in uniqueAudiosByType) {
    uniqueAudiosByType[type] = Array.from(uniqueAudiosByType[type]);
  }

  return uniqueAudiosByType;
}
export {getUniqueAudiosByType};