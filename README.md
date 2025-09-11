# Final Project: Frontend

## About The Project

Coderealm-FE is the frontend application of the Coderealm platform — a gamified learning environment for web development.

Coderealm is an educational role-playing platform designed to teach web development in an engaging, game-like environment.
It combines the features of:
- Role-Playing: Players progress through levels and quests.
- Learning Platform: Structured lessons with theory and practice.
- Forum: A space to ask questions and collaborate.
- AI Assistance: Smart hints and code feedback to support learning.
- Challenges & Hackathons: Competitive coding and team-based problem solving.

It provides the user interface, code editor, interactive lessons, and challenge system, connecting with the backend (Coderealm-BE) via API.

### Live Demo
Check out the live version of Coderealm <a href="https://coderealm-e7af.onrender.com/"> here </a>.
<br><br>
**Disclaimer:** It may take some time for the backend to load if Coderealm has not been visited for a long time. Therefore, it will take a while to load when you log in for the first time. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Built With

- **Vite.js** <br>
A fast modern frontend build tool that provides an optimized development server and efficient production builds.
- **react** <br>
A JavaScript library for building user interfaces using reusable components and a virtual DOM. We used libraries like react-router and react split for managing views. 
- **SASS** <br>
A CSS preprocessor that adds features like variables, nesting, and mixins to write more maintainable styles.
- **TailwindCSS** <br>
Beside SASS we also used TailwindCSS for several parts at Coderealm. A utility-first CSS framework that provides predefined classes to rapidly build custom, responsive designs.
- **Three** <br>
A JavaScript library for creating and displaying 3D graphics in the browser using WebGL.
- **Eslint** <br>
A linting tool that analyzes JavaScript/TypeScript code to detect problems and enforce consistent coding standards.
- **Monaco-Editor** <br>
A code editor developed by Microsoft, used in VS Code and web applications, with features like syntax highlighting, IntelliSense, and code navigation.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project Structure

**src/**
<br>
This is where the main code is written. There you will find the React components, styles, contexts and general logic for the frontend. Also the assets are store in this fodler. 

**env.example**
<br>
Example configuration file with required environment variables (PORT, keys, etc.).

**index.html**
<br>
This is the main HTML entry point.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Integration with Backend
The frontend communicates with Coderealm-BE via REST API.

**Example flow:**
1. User logs in → API call to /api/auth/login.
2. Lessons and challenges are fetched from /api/challenges.
3. Code submissions are sent to /api/challenges/submit and results displayed in the Monaco editor.

## Screenshots
![Screenshot1](assets-README/Screenshot1_Landing-page.png) 
Landing page
<br>
<br>
![Screenshot2](assets-README/Screenshot2_Landing-page-user-1.png) 
Landing page user - Stats overview
<br>
<br>
![Screenshot3](assets-README/Screenshot3_Landing-page-user-2.png) 
<br>
Landing page user - Explore the realm
<br>
<br>
![Screenshot4](assets-README/Screenshot4_University-course-overview.png) 
<br>
University - Courses Overview
<br>
<br>
![Screenshot5](assets-README/Screenshot5_University-lesson.png) 
<br>
University - Lesson
<br>
<br>
![Screenshot6](assets-README/Screenshot6_Forumia.png) 
<br>
Forumia
<br>
<br>
![Screenshot7](assets-README/Screenshot7_Forumia-Post.png) 
<br>
Forumia - Post
<br>
<br>
![Screenshot8](assets-README/Screenshot8_Playground.png) 
<br>
Playground
<br>
<br>
![Screenshot9](assets-README/Screenshot9_Chatbot.png) 
<br>
Chatbot
<br>
<br>
![Screenshot10](assets-README/Screenshot10_Profile.png) 
<br>
Profile
<br>
<br>

<!-- ROADMAP -->
<!-- ## Roadmap


<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->


<!-- CONTACT -->
## Contact

Ahmad Al Sayed
<br>
Mail: -
<br><br>
Avdyl Zekaj
<br>
Mail: -
<br><br>
Divya Sheen
<br>
Mail: divyam.sheen@gmail.com
<br><br>
Judith Bohmann
<br>
Mail: ju.bohmann@gmx.de
<br><br>
Repo-Link: <a href="https://github.com/You-Did-Bowman/Coderealm-BE">github.com/You-Did-Bowman/Coderealm-BE</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>