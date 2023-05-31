---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

<i class="fas fa-lightbulb" style="color: #ffc31f;"></i> Hint: click the title to know more!

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

  <ul style="list-style-type: square;">{% for post in site.publications reversed %}
    {% include archive-single-publication.html %}
  {% endfor %}</ul>
