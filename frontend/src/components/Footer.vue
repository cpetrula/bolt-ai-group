<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>
            <i class="pi pi-bolt"></i>
            Bolt AI Group
          </h3>
          <p>
            Empowering local businesses with accessible AI technologies 
            that drive growth, efficiency, and excellent customer experiences.
          </p>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Connect</h4>
          <div class="social-links">
            <a href="#" aria-label="Facebook"><i class="pi pi-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i class="pi pi-twitter"></i></a>
            <a href="#" aria-label="LinkedIn"><i class="pi pi-linkedin"></i></a>
            <a href="#" aria-label="Instagram"><i class="pi pi-instagram"></i></a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Bolt AI Group. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #2d3748;
  color: white;
  padding: 3rem 0 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.footer-section h4 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.footer-section p {
  line-height: 1.8;
  opacity: 0.9;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: white;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.footer-section ul li a:hover {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.social-links a:hover {
  background: rgba(255,255,255,0.2);
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1.5rem;
  text-align: center;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
