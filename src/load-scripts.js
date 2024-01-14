const evalInContext = (str, context) => {
  return (new Function(`with(this) {return ${str}}`)).call(context);
};
const loadScripts = (self, scripts) => {
  const audios = {
    Script: [],
    Sfx: [],
    Music: []
  };
  Object.keys(scripts).forEach(key => {
    const text = scripts[key];
    self[key] = evalInContext(text, self);
    const regex = /play(Script|Sfx|Music)\s*\(\s*['"]?([^'"\)]*)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const type = match[1];
      const name = match[2].split(/,/g)[0].trim();
      if(!audios[type].includes(name)) audios[type].push(name);
    }
  });
  return audios;
};

export {loadScripts};