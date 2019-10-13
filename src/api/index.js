const { REACT_APP_NUCLEAR_MONITOR_API } = process.env;

export async function getPlants() {
  await new Promise(resolve => setTimeout(resolve, 200));

  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/plants`);
  const data = await res.json();

  return data;
}

export async function getReactors() {
  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/reactors`);
  const data = await res.json();

  return data;
}

export async function getProductions() {
  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/productions`);
  const data = await res.json();

  return data;
}
