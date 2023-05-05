const data = {
  name: '',
  age: 0,
};
const inputName = document.createElement('input');
inputName.setAttribute('type', 'text');
inputName.setAttribute('id', 'name');
inputName.setAttribute('value', data.name);

const inputAge = document.createElement('input');
inputAge.setAttribute('type', 'number');
inputAge.setAttribute('id', 'age');
inputAge.setAttribute('value', data.age);

const observer = new MutationObserver((mutationsList) => {
  console.log(mutationsList, 'mutationsList')
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'attributes') {
      const value = mutation.target.value;
      const property = mutation.target.id;
      data[property] = isNaN(value) ? value : Number(value);
      console.log(data);
    }
  });
});

observer.observe(inputName, { attributes: true });
observer.observe(inputAge, { attributes: true });

