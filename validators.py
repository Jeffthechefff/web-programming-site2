"""Week 8: server-side checks. Only cleaned values reach the profile page."""
import math
import re
from datetime import date
from urllib.parse import urlsplit

MAJORS = {'computer', 'electrical', 'biomedical', 'telecommunications'}
GRADUATION = {'spring', 'summer', 'fall'}
SKILLS = {'programming', 'embedded-systems', 'electronics', 'computer-networks',
          'telecommunications', 'biomedical-instrumentation',
          'artificial-intelligence-machine-learning', 'signal-processing'}
SOFTWARE = {'matlab', 'simulink', 'labview', 'ltspice', 'vivado', 'solidworks'}
PROJECT_AREAS = {'artificial-intelligence', 'web-applications', 'cybersecurity',
                 'internet-of-things', 'power-systems', 'renewable-energy',
                 'control-systems', 'medical-imaging', 'biosensors', 'medical-devices',
                 'wireless-communications', '5g-6g-networks'}
# Include all required fields from the user's current HTML form.
REQUIRED = {'student_id', 'fullname', 'email', 'major', 'gpa', 'graduation',
            'internship_completed', 'confirmation'}


def validate_profile(form):
    errors, cleaned = {}, {}
    fields = ('student_id fullname email phone birthdate portfolio gin446 major gpa '
              'credits graduation graduation_month internship_completed language '
              'project_title project_area description team_size project_color '
              'meeting_date meeting_time confirmation').split()
    for field in fields:
        cleaned[field] = form.get(field, '').strip()
        if len(form.getlist(field)) > 1:
            errors[field] = 'Submit only one value for this field.'
    for field in REQUIRED:
        if not cleaned[field]:
            errors[field] = 'This field is required.'
    cleaned['email'] = cleaned['email'].lower()

    def pattern(field, regex, message):
        if cleaned[field] and not re.fullmatch(regex, cleaned[field], re.ASCII):
            errors[field] = message

    pattern('student_id', r'[0-9]{9}', 'Student ID must be exactly 9 digits.')
    pattern('fullname', r"[A-Za-z][A-Za-z .'\-]{1,79}",
            'Use letters, spaces, periods, hyphens or apostrophes (2-80 characters).')
    pattern('email', r'[a-z0-9]+(?:[._+\-][a-z0-9]+)*@(?:net\.)?usek\.edu\.lb',
            'Use your USEK email (...@usek.edu.lb or ...@net.usek.edu.lb).')
    # Lebanese country code followed by a 7- or 8-digit national number.
    phone = re.sub(r'[ -]', '', cleaned['phone'])
    if phone and not re.fullmatch(r'\+961[1-9][0-9]{6,7}', phone):
        errors['phone'] = 'Enter a Lebanese number, e.g. +961 70 123456.'
    cleaned['phone'] = phone
    pattern('portfolio', r'https://github\.com/[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?/?',
            'Use a GitHub profile URL: https://github.com/username')
    if cleaned['gin446']:
        try:
            url = urlsplit(cleaned['gin446'])
            valid = (url.scheme == 'https' and url.hostname and not url.username
                     and not url.password and not re.search(r'\s', cleaned['gin446']))
            _ = url.port
        except ValueError:
            valid = False
        if not valid:
            errors['gin446'] = 'Enter a valid https:// link.'

    for field, allowed in [('major', MAJORS), ('graduation', GRADUATION),
                           ('internship_completed', {'yes', 'no'}),
                           ('project_area', PROJECT_AREAS)]:
        if cleaned[field] and cleaned[field] not in allowed:
            errors[field] = 'Choose a valid option.'
    for field, low, high, whole in [('gpa', 40, 100, False), ('credits', 0, 148, True),
                                   ('team_size', 1, 4, True)]:
        if cleaned[field]:
            try:
                if whole and not re.fullmatch(r'[0-9]+', cleaned[field]):
                    raise ValueError
                number = int(cleaned[field]) if whole else float(cleaned[field])
                if not math.isfinite(number) or not low <= number <= high:
                    raise ValueError
            except (ValueError, OverflowError):
                errors[field] = f'Enter a {"whole number" if whole else "number"} between {low} and {high}.'

    for field in ('birthdate', 'meeting_date'):
        if cleaned[field]:
            try:
                if not re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}', cleaned[field]):
                    raise ValueError
                day = date.fromisoformat(cleaned[field])
                if field == 'birthdate':
                    today = date.today()
                    age = today.year - day.year - ((today.month, today.day) < (day.month, day.day))
                    if day > today:
                        errors[field] = 'Date of birth cannot be in the future.'
                    elif not 15 <= age <= 100:
                        errors[field] = 'Age must be between 15 and 100.'
            except ValueError:
                errors[field] = 'Enter a valid date (YYYY-MM-DD).'
    if cleaned['graduation_month']:
        try:
            if not re.fullmatch(r'[0-9]{4}-(?:0[1-9]|1[0-2])', cleaned['graduation_month']):
                raise ValueError
            date.fromisoformat(cleaned['graduation_month'] + '-01')
        except ValueError:
            errors['graduation_month'] = 'Enter a valid month (YYYY-MM).'
    if cleaned['meeting_time']:
        value = cleaned['meeting_time']
        if not re.fullmatch(r'(?:[01][0-9]|2[0-3]):[0-5][0-9]', value):
            errors['meeting_time'] = 'Use HH:MM.'
        elif not '08:00' <= value <= '18:00':
            errors['meeting_time'] = 'Pick a time between 08:00 and 18:00.'
    for field, limit in [('language', 40), ('project_title', 120), ('description', 1000)]:
        if len(cleaned[field]) > limit:
            errors[field] = f'Use {limit} characters or fewer.'
    for field, allowed in [('skills', SKILLS), ('software', SOFTWARE)]:
        values = form.getlist(field)
        if any(value not in allowed for value in values):
            errors[field] = 'One or more selected options are not recognised.'
        cleaned[field] = list(dict.fromkeys(value for value in values if value in allowed))
    cleaned['project_color'] = cleaned['project_color'] or '#336699'
    pattern('project_color', r'#[0-9a-fA-F]{6}', 'Use a colour like #336699.')
    if cleaned['confirmation'] != 'yes':
        errors['confirmation'] = 'You must confirm the information is accurate.'
    # This is application metadata, not a value trusted from the browser.
    cleaned['form_version'] = '2026-2027'
    return errors, cleaned
