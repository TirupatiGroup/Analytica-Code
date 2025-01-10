# Analytica Project

Welcome to the **Analytica Project** repository! This project is organized to ensure efficient collaboration and seamless development. Below, you'll find detailed information about the branch structure, setup instructions, and commands for getting started.

---

## 🌟 Branch Structure

1. **`main`**  
   - 💻 **Production-Ready Code**: Stable, tested, and ready for deployment.

2. **`develop`**  
   - 🔧 **In-Progress Development**: Active development happens here before merging into `main`.

3. **`front-end`**  
   - 🎨 **Front-End Code**: Contains all the code related to the user interface and client-side logic.

4. **`back-end`**  
   - 🛠️ **Back-End Code**: Contains all the code related to server-side logic and APIs.

---

## 🚀 Getting Started

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/TirupatiGroup/Analytica-Code.git
```

---

### **Step 2: Pull the Desired Branch**
- **Pull the `main` branch (Production):**
  ```bash
  git checkout main
  git pull origin main
  ```

- **Pull the `develop` branch (Development):**
  ```bash
  git checkout develop
  git pull origin develop
  ```

- **Pull the `front-end` branch:**
  ```bash
  git checkout front-end
  git pull origin front-end
  ```

- **Pull the `back-end` branch:**
  ```bash
  git checkout back-end
  git pull origin back-end
  ```

---

### **Step 3: Install Dependencies**

1. **Navigate to the Root Folder (`main` branch):**
   ```bash
   npm install
   ```

2. **Install Front-End Dependencies:**
   ```bash
   cd Front-End
   npm install
   ```

3. **Install Back-End Dependencies:**
   ```bash
   cd ../Back-End
   npm install
   ```

---

### **Step 4: Run the Project**

1. **Return to the Root Folder:**
   ```bash
   cd ..
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## 🛠️ Commands at a Glance

| **Action**               | **Command**                                  |
|--------------------------|----------------------------------------------|
| Clone repository         | `git clone https://github.com/TirupatiGroup/Analytica-Code.git` |
| Pull `main` branch       | `git checkout main && git pull origin main` |
| Pull `develop` branch    | `git checkout develop && git pull origin develop` |
| Pull `front-end` branch  | `git checkout front-end && git pull origin front-end` |
| Pull `back-end` branch   | `git checkout back-end && git pull origin back-end` |
| Install dependencies     | `npm install`                               |
| Start development server | `npm run dev`                               |

---

## 📋 Notes

- Ensure you have **Node.js** and **npm** installed on your system.
- Use the appropriate branch for development or production.

> 💡 **Pro Tip:** Always pull the latest changes before starting development to avoid conflicts.

---

### 💻 Happy Coding!



## Installation

Install my-project with npm

```bash
npm install my-project
cd my-project
```

## Usage/Examples

```javascript
import Component from 'my-project'

function App() {
  return <Component />
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)