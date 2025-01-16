module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: 'serve --host',
      cwd: './front-end', // Path to your frontend project
      interpreter: 'node', // Use Node.js as the interpreter
      watch: false,
    },
    {
      name: 'backend',
      script: 'node',
      args: 'index.js', // Your backend entry file
      cwd: './back-end', // Path to your backend project
      watch: false,
    },
  ],
};
