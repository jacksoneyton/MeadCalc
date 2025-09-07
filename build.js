#!/usr/bin/env node

/**
 * MeadCalc Build Script for Cloudflare Pages
 * Optimizes files for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Building MeadCalc for Cloudflare Pages...');

// Add cache-busting timestamp to HTML files
function addCacheBusting() {
    const timestamp = Date.now();
    const htmlFiles = ['index.html', 'test.html', 'unified_brewing_calculator_EXAMPLE.html'];
    
    htmlFiles.forEach(filename => {
        if (fs.existsSync(filename)) {
            let content = fs.readFileSync(filename, 'utf8');
            
            // Add cache-busting query parameters to CSS and JS references
            content = content.replace(
                /href="([^"]*\.css)"/g, 
                `href="$1?v=${timestamp}"`
            );
            content = content.replace(
                /src="([^"]*\.js)"/g, 
                `src="$1?v=${timestamp}"`
            );
            
            // Add build timestamp comment
            content = `<!-- Built: ${new Date().toISOString()} -->\n${content}`;
            
            fs.writeFileSync(filename, content);
            console.log(`✅ Cache busting applied to ${filename}`);
        }
    });
}

// Validate that all required files exist
function validateFiles() {
    const requiredFiles = ['index.html', 'calculator.js', 'styles.css'];
    let allValid = true;
    
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            console.error(`❌ Missing required file: ${file}`);
            allValid = false;
        } else {
            const stats = fs.statSync(file);
            console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
        }
    });
    
    return allValid;
}

// Create a simple sitemap.xml for SEO
function createSitemap() {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://meadcalc.pages.dev/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>1.0</priority>
    </url>
</urlset>`;
    
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log('✅ Sitemap created');
}

// Main build process
function build() {
    try {
        console.log('📁 Validating files...');
        if (!validateFiles()) {
            process.exit(1);
        }
        
        console.log('⚡ Applying cache busting...');
        addCacheBusting();
        
        console.log('🗺️ Creating sitemap...');
        createSitemap();
        
        console.log('✅ Build completed successfully!');
        console.log('🌐 Ready for Cloudflare Pages deployment');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build if called directly
if (require.main === module) {
    build();
}

module.exports = { build, validateFiles, addCacheBusting };