const ID = id => document.getElementById(id);
const CLS = cls => document.getElementsByClassName(cls);
const Q = query => document.querySelectorAll(query);

const createtag = (tag, {cls, id, txt}=o) => {
	let el = document.createElement(tag);
	if (cls) el.className = cls;
	if (id) el.id = id;
	if (txt) el.textContent = txt;
	return el;
};