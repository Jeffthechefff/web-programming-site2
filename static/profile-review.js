// Week 6: select elements, listen for events, then update the DOM.
const form = document.getElementById("profile-form");
const panel = document.getElementById("review-panel");
const reviewValues = document.getElementById("review-values");
const reviewHeading = document.getElementById("review-heading");
const step = document.getElementById("review-step");
const editButton = document.getElementById("edit-profile");
const confirmButton = document.getElementById("confirm-profile");

// Read ordinary inputs and textarea values (all are strings).
function readValue(id) {
  return document.getElementById(id).value;
}

// Use the visible option label for a readable review.
function readSelect(id) {
  const select = document.getElementById(id);
  return select.value ? select.selectedOptions[0].textContent : "";
}

// Add read-only text, never HTML made from the user's input.
function addReviewRow(label, value) {
  const title = document.createElement("dt");
  const answer = document.createElement("dd");
  title.textContent = label;
  answer.textContent = value || "Not provided";
  reviewValues.appendChild(title);
  reviewValues.appendChild(answer);
}

function buildReview() {
  // Clear the previous review so edits appear without duplicate rows.
  reviewValues.textContent = "";

  // :checked finds the selected radio or checked checkboxes.
  const graduation = form.querySelector('input[name="graduation"]:checked')?.value;
  const internship = form.querySelector('input[name="internship_completed"]:checked')?.value;
  const skills = [...form.querySelectorAll('input[name="skills"]:checked')]
    .map(cb => cb.value);
  const software = [...document.getElementById("software").selectedOptions]
    .map(opt => opt.value);

  addReviewRow("Form version", form.querySelector('[name="form_version"]').value);
  addReviewRow("Student ID", readValue("student_id"));
  addReviewRow("Full name", readValue("fullname"));
  addReviewRow("USEK email", readValue("email"));
  addReviewRow("Mobile number", readValue("phone"));
  addReviewRow("Date of birth", readValue("birthdate"));
  addReviewRow("GitHub", readValue("portfolio"));
  addReviewRow("GIN446 website", readValue("gin446"));
  addReviewRow("Engineering major", readSelect("major"));
  addReviewRow("GPA / 100", readValue("gpa"));
  addReviewRow("Credits completed", readValue("credits"));
  addReviewRow("Graduation semester", graduation);
  addReviewRow("Graduation month and year", readValue("graduation_month"));
  addReviewRow("Internship completed", internship);
  addReviewRow("Technical skills", skills.length ? skills.join(", ") : "None selected");
  addReviewRow("Primary programming language", readValue("language"));
  addReviewRow("Engineering software", software.length ? software.join(", ") : "None selected");
  addReviewRow("Project title", readValue("project_title"));
  addReviewRow("Project area", readSelect("project_area"));
  addReviewRow("Project description", readValue("description"));
  addReviewRow("Team size", readValue("team_size"));
  addReviewRow("Dashboard color", readValue("project_color"));
  addReviewRow("Meeting date", readValue("meeting_date"));
  addReviewRow("Meeting time", readValue("meeting_time"));
  addReviewRow("Information confirmed accurate", readValue("confirmation"));
}

function returnToForm() {
  panel.classList.remove("open");
  form.classList.remove("review-hidden");
  step.classList.remove("review-hidden");
  document.getElementById("review-submit").focus();
}

form.addEventListener("submit", function (event) {
  event.preventDefault(); // Stop the POST and the page reload.

  if (!form.checkValidity()) {
    form.reportValidity(); // Display the browser's own validation warnings.
    return;
  }

  buildReview();
  form.classList.add("review-hidden");
  step.classList.add("review-hidden");
  panel.classList.add("open");
  reviewHeading.focus();
});

editButton.addEventListener("click", returnToForm);

confirmButton.addEventListener("click", function () {
  // submit() skips native validation, so check again before using it.
  if (!form.checkValidity()) {
    returnToForm(); // Invalid controls must be visible for warning bubbles.
    form.reportValidity();
    return;
  }

  // Send the ORIGINAL form to its existing action using its existing method.
  // submit() does not fire another submit event: no interceptor loop.
  form.submit();
});

// Let our submit listener run validation explicitly. If JS does not load,
// the HTML keeps its normal native validation and Week 4 submission behavior.
form.noValidate = true;
