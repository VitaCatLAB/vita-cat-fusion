// vite.config.ts
import { defineApplicationConfig } from "file:///Users/hanrui/Documents/JoyNop/demo-app/vita-cat-fusion/internal/vite-config/dist/index.mjs";
var vite_config_default = defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [
        "echarts/core",
        "echarts/charts",
        "echarts/components",
        "echarts/renderers",
        "qrcode",
        "@iconify/iconify",
        "ant-design-vue/es/locale/zh_CN",
        "ant-design-vue/es/locale/en_US"
      ]
    },
    server: {
      proxy: {
        "/basic-api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/basic-api`), "")
          // only https
          // secure: false
        },
        "/dev-api": {
          target: "http://192.168.31.249:48080",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/dev-api`), "")
          // only https
          // secure: false
        },
        "/upload": {
          target: "http://localhost:3300/upload",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/upload`), "")
        },
        "/img": {
          target: "https://cdn.duobangbox.com",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/img`), "")
          // only https
          // secure: false
        }
      },
      open: true,
      // 项目启动后，自动打开
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaGFucnVpL0RvY3VtZW50cy9Kb3lOb3AvZGVtby1hcHAvdml0YS1jYXQtZnVzaW9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvaGFucnVpL0RvY3VtZW50cy9Kb3lOb3AvZGVtby1hcHAvdml0YS1jYXQtZnVzaW9uL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9oYW5ydWkvRG9jdW1lbnRzL0pveU5vcC9kZW1vLWFwcC92aXRhLWNhdC1mdXNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVBcHBsaWNhdGlvbkNvbmZpZyB9IGZyb20gJ0B2YmVuL3ZpdGUtY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQXBwbGljYXRpb25Db25maWcoe1xuICBvdmVycmlkZXM6IHtcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ2VjaGFydHMvY29yZScsXG4gICAgICAgICdlY2hhcnRzL2NoYXJ0cycsXG4gICAgICAgICdlY2hhcnRzL2NvbXBvbmVudHMnLFxuICAgICAgICAnZWNoYXJ0cy9yZW5kZXJlcnMnLFxuICAgICAgICAncXJjb2RlJyxcbiAgICAgICAgJ0BpY29uaWZ5L2ljb25pZnknLFxuICAgICAgICAnYW50LWRlc2lnbi12dWUvZXMvbG9jYWxlL3poX0NOJyxcbiAgICAgICAgJ2FudC1kZXNpZ24tdnVlL2VzL2xvY2FsZS9lbl9VUycsXG4gICAgICBdLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwcm94eToge1xuICAgICAgICAnL2Jhc2ljLWFwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4vYmFzaWMtYXBpYCksICcnKSxcbiAgICAgICAgICAvLyBvbmx5IGh0dHBzXG4gICAgICAgICAgLy8gc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnL2Rldi1hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzE5Mi4xNjguMzEuMjQ5OjQ4MDgwJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgd3M6IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeL2Rldi1hcGlgKSwgJycpLFxuICAgICAgICAgIC8vIG9ubHkgaHR0cHNcbiAgICAgICAgICAvLyBzZWN1cmU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICcvdXBsb2FkJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzMwMC91cGxvYWQnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4vdXBsb2FkYCksICcnKSxcbiAgICAgICAgfSxcbiAgICAgICAgJy9pbWcnOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9jZG4uZHVvYmFuZ2JveC5jb20nLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4vaW1nYCksICcnKSxcbiAgICAgICAgICAvLyBvbmx5IGh0dHBzXG4gICAgICAgICAgLy8gc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIG9wZW46IHRydWUsIC8vIFx1OTg3OVx1NzZFRVx1NTQyRlx1NTJBOFx1NTQwRVx1RkYwQ1x1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFxuICAgICAgd2FybXVwOiB7XG4gICAgICAgIGNsaWVudEZpbGVzOiBbJy4vaW5kZXguaHRtbCcsICcuL3NyYy97dmlld3MsY29tcG9uZW50c30vKiddLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsK0JBQStCO0FBRS9YLElBQU8sc0JBQVEsd0JBQXdCO0FBQUEsRUFDckMsV0FBVztBQUFBLElBQ1QsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLGNBQWM7QUFBQSxVQUNaLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLElBQUk7QUFBQSxVQUNKLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE9BQU8sYUFBYSxHQUFHLEVBQUU7QUFBQTtBQUFBO0FBQUEsUUFHL0Q7QUFBQSxRQUNBLFlBQVk7QUFBQSxVQUNWLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLElBQUk7QUFBQSxVQUNKLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE9BQU8sV0FBVyxHQUFHLEVBQUU7QUFBQTtBQUFBO0FBQUEsUUFHN0Q7QUFBQSxRQUNBLFdBQVc7QUFBQSxVQUNULFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLElBQUk7QUFBQSxVQUNKLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE9BQU8sVUFBVSxHQUFHLEVBQUU7QUFBQSxRQUM1RDtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsSUFBSTtBQUFBLFVBQ0osU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLElBQUksT0FBTyxPQUFPLEdBQUcsRUFBRTtBQUFBO0FBQUE7QUFBQSxRQUd6RDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE1BQU07QUFBQTtBQUFBLE1BQ04sUUFBUTtBQUFBLFFBQ04sYUFBYSxDQUFDLGdCQUFnQiw0QkFBNEI7QUFBQSxNQUM1RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
