const API_URL = "https://api.mocosmo.me";

const loadingEl = document.getElementById("loading");
const errorStateEl = document.getElementById("error-state");
const errorMessageEl = document.getElementById("error-message");
const formContainerEl = document.getElementById("form-container");
const eventTitleEl = document.getElementById("event-title");
const eventDescriptionEl = document.getElementById("event-description");
const fieldsEl = document.getElementById("fields");
const registerForm = document.getElementById("register-form");
const submitBtn = document.getElementById("submit-btn");
const formErrorEl = document.getElementById("form-error");
const successStateEl = document.getElementById("success-state");
const successMessageEl = document.getElementById("success-message");

function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}

async function loadForm() {
  try {
    const res = await fetch(`${API_URL}/api/form`);
    if (!res.ok) throw new Error("Server responded with " + res.status);

    const config = await res.json();
    renderForm(config);
  } catch (err) {
    console.error("Failed to load form:", err);
    hide(loadingEl);
    errorMessageEl.textContent =
      "No se pudo conectar con el servidor. Intenta de nuevo más tarde.";
    show(errorStateEl);
  }
}

// Build form fields dynamically from the config JSON.
function renderForm(config) {
  eventTitleEl.textContent = config.event_title;
  eventDescriptionEl.textContent = config.event_description;

  fieldsEl.innerHTML = "";

  for (const field of config.fields) {
    const group = document.createElement("div");
    group.className = "field-group";

    const label = document.createElement("label");
    label.setAttribute("for", field.name);
    label.textContent = field.label;
    if (field.required) {
      const star = document.createElement("span");
      star.className = "required";
      star.textContent = " *";
      label.appendChild(star);
    }
    group.appendChild(label);

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      input.id = field.name;
      input.name = field.name;
      if (field.required) input.required = true;

      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = "— Selecciona una opción —";
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      input.appendChild(defaultOpt);

      for (const opt of field.options) {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      }
    } else {
      input = document.createElement("input");
      input.type = field.type;
      input.id = field.name;
      input.name = field.name;
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.required) input.required = true;
    }

    group.appendChild(input);
    fieldsEl.appendChild(group);
  }

  hide(loadingEl);
  show(formContainerEl);
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(formErrorEl);

  const formData = new FormData(registerForm);
  const body = Object.fromEntries(formData.entries());

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      formErrorEl.textContent = data.error || "Error desconocido.";
      show(formErrorEl);
      submitBtn.disabled = false;
      submitBtn.textContent = "Registrarme";
      return;
    }

    hide(formContainerEl);
    successMessageEl.textContent = data.message;
    show(successStateEl);
  } catch (err) {
    console.error("Submit error:", err);
    formErrorEl.textContent = "Error de conexión. Intenta de nuevo.";
    show(formErrorEl);
    submitBtn.disabled = false;
    submitBtn.textContent = "Registrarme";
  }
});

loadForm();
