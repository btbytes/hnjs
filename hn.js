const $ = (id) => document.getElementById(id);

const byClass = (el, cl) => (el ? el.getElementsByClassName(cl) : []);

const byTag = (el, tg) => (el ? el.getElementsByTagName(tg) : []);

const allof = (cl) => byClass(document, cl);

const classes = (el) => (el && el.className && el.className.split(" ")) || [];

const hasClass = (el, cl) => afind(cl, classes(el));

const addClass = (el, cl) => {
  if (el) {
    const a = classes(el);
    if (!afind(cl, a)) {
      a.unshift(cl);
      el.className = a.join(" ");
    }
  }
};

const remClass = (el, cl) => {
  if (el) {
    const a = classes(el);
    arem(a, cl);
    el.className = a.join(" ");
  }
};

const uptil = (el, f) => (el ? (f(el) ? el : uptil(el.parentNode, f)) : null);

const upclass = (el, cl) => uptil(el, (x) => hasClass(x, cl));

const html = (el) => (el ? el.innerHTML : null);

const attr = (el, name) => el.getAttribute(name);

const tonum = (x) => {
  const n = parseFloat(x);
  return isNaN(n) ? null : n;
};

const remEl = (el) => el.parentNode.removeChild(el);

const posf = (f, a) => {
  for (let i = 0; i < a.length; i++) {
    if (f(a[i])) return i;
  }
  return -1;
};

const apos = (x, a) =>
  typeof x == "function" ? posf(x, a) : Array.prototype.indexOf.call(a, x);

const afind = (x, a) => {
  const i = apos(x, a);
  return i >= 0 ? a[i] : null;
};

const acut = (a, m, n) => Array.prototype.slice.call(a, m, n);

const aeach = (fn, a) => Array.prototype.forEach.call(a, fn);

const arem = (a, x) => {
  const i = apos(x, a);
  if (i >= 0) {
    a.splice(i, 1);
  }
  return a;
};

const alast = (a) => a[a.length - 1];

const vis = (el, on) => {
  if (el) {
    on ? remClass(el, "nosee") : addClass(el, "nosee");
  }
};

const setshow = (el, on) => {
  on ? remClass(el, "noshow") : addClass(el, "noshow");
};

const noshow = (el) => setshow(el, false);

const ind = (tr) => {
  const el = byClass(tr, "ind")[0];
  return el ? tonum(attr(el, "indent")) : null;
};

const vurl = (id, how, auth, _goto) =>
  `vote?id=${id}&how=${how}&auth=${auth}&goto=${encodeURIComponent(
    _goto,
  )}&js=t`;

const vote = (id, how, auth, _goto) => {
  vis($(`up_${id}`), how == "un");
  vis($(`down_${id}`), how == "un");
  let unv = "";
  if (how != "un") {
    unv = ` | <a id='un_${id}' class='clicky' href='${vurl(
      id,
      "un",
      auth,
      _goto,
    )}'>${how == "up" ? "unvote" : "undown"}</a>`;
  }
  $(`unv_${id}`).innerHTML = unv;
  new Image().src = vurl(id, how, auth, _goto);
};

const nextcomm = (el) => {
  while ((el = el.nextElementSibling)) {
    if (hasClass(el, "comtr")) return el;
  }
};

const kidvis = (tr, show) => {
  const n0 = ind(tr);
  const n = ind(nextcomm(tr));
  let coll = false;
  if (n > n0) {
    while ((tr = nextcomm(tr))) {
      if (ind(tr) <= n0) {
        break;
      } else if (!show) {
        setshow(tr, false);
      } else if (ind(tr) == n) {
        coll = hasClass(tr, "coll");
        setshow(tr, true);
      } else if (!coll) {
        setshow(tr, true);
      }
    }
  }
};

const toggleCollapse = (id) => {
  const tr = $(id);
  const coll = !hasClass(tr, "coll");
  collstate(tr, coll);
  kidvis(tr, !coll);
  if ($("logout")) {
    new Image().src = `collapse?id=${id}${coll ? "" : "&un=true"}`;
  }
};

const collstate = (tr, coll) => {
  coll ? addClass(tr, "coll") : remClass(tr, "coll");
  vis(byClass(tr, "votelinks")[0], !coll);
  setshow(byClass(tr, "comment")[0], !coll);
  const el = byClass(tr, "togg")[0];
  el.innerHTML = coll ? `[${attr(el, "n")} more]` : "[–]";
};

const onop = () => attr(byTag(document, "html")[0], "op");

const ranknum = (el) => {
  const s = html(el) || "";
  const a = s.match(/[0-9]+/);
  if (a) {
    return tonum(a[0]);
  }
};

const n1 = ranknum(allof("rank")[0]) || 1;

const newstory = (pair) => {
  if (pair) {
    const sp = alast(allof("spacer"));
    sp.insertAdjacentHTML("afterend", `${pair[0]}${sp.outerHTML}`);
    fixranks();
    if (onop() == "newest") {
      const n = ranknum(alast(allof("rank")));
      allof("morelink")[0].href = `newest?next=${pair[1]}&n=${n + 1}`;
    }
  }
};

const fixranks = () => {
  const rks = allof("rank");
  aeach((rk) => {
    rk.innerHTML = `${apos(rk, rks) + n1}.`;
  }, rks);
};

const moreurl = () => allof("morelink")[0].href;
const morenext = () => tonum(moreurl().split("next=")[1]);

const hidestory = (el, id) => {
  for (let i = 0; i < 3; i++) {
    remEl($(id).nextSibling);
  }
  remEl($(id));
  fixranks();
  const next = onop() == "newest" && morenext() ? `&next=${morenext()}` : "";
  const url = el.href.replace("hide", "snip-story").replace("goto", "onop");
  fetch(`${url}${next}`)
    .then((r) => r.json())
    .then(newstory);
};

const onclick = (ev) => {
  const el = upclass(ev.target, "clicky");
  if (el) {
    const u = new URL(el.href, location);
    const p = u.searchParams;
    if (u.pathname == "/vote") {
      vote(p.get("id"), p.get("how"), p.get("auth"), p.get("goto"));
    } else if (u.pathname == "/hide") {
      hidestory(el, p.get("id"));
    } else if (hasClass(el, "togg")) {
      toggleCollapse(attr(el, "id"));
    } else {
      $(u.hash.substring(1)).scrollIntoView({ behavior: "smooth" });
    }
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    ev.preventDefault();
    return false;
  }
};

document.addEventListener("click", onclick);
