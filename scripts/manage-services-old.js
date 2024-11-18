const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all service directories
const getServiceDirs = () => {
    const servicesPath = path.join(__dirname, '..', 'services');
    return fs.readdirSync(servicesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
};

// Convert directory name to project name (remove -service suffix if exists)
const getProjectName = (dirName) => {
    return dirName.replace(/-service$/, '');
};

// Ensure proper directory structure
const ensureServiceStructure = (serviceDir) => {
    const servicePath = path.join(__dirname, '..', 'services', serviceDir);
    const srcPath = path.join(servicePath, 'src');

    // Create src directory if it doesn't exist
    if (!fs.existsSync(srcPath)) {
        fs.mkdirSync(srcPath, { recursive: true });
        console.log(`Created src directory for ${serviceDir}`);

        // Move all .ts files to src directory
        fs.readdirSync(servicePath).forEach(file => {
            if (file.endsWith('.ts')) {
                const oldPath = path.join(servicePath, file);
                const newPath = path.join(srcPath, file);
                fs.renameSync(oldPath, newPath);
                console.log(`Moved ${file} to src directory in ${serviceDir}`);
            }
        });
    }
};

// Generate or update nest-cli.json
const updateNestConfig = () => {
    const services = getServiceDirs();
    const configPath = path.join(__dirname, '..', 'nest-cli.json');

    const nestConfig = {
        "$schema": "https://json.schemastore.org/nest-cli",
        "collection": "@nestjs/schematics",
        "sourceRoot": "services",
        "monorepo": true,
        "root": "services",
        "projects": {}
    };

    // Add each service to the projects configuration
    services.forEach(serviceDir => {
        const projectName = getProjectName(serviceDir);
        nestConfig.projects[projectName] = {
            type: "application",
            root: `services/${serviceDir}`,
            entryFile: "src/main",
            sourceRoot: "src",
            compilerOptions: {
                tsConfigPath: `services/${serviceDir}/tsconfig.json`,
                webpack: false,
                builder: "tsc"
            }
        };
    });

    // Write the updated configuration
    fs.writeFileSync(configPath, JSON.stringify(nestConfig, null, 2));
    console.log('Updated nest-cli.json with current services');
};

const updateServiceTsConfig = (serviceDir) => {
    const tsconfigPath = path.join(__dirname, '..', 'services', serviceDir, 'tsconfig.json');
    const tsconfig = {
        extends: "../../tsconfig.json",
        compilerOptions: {
            declaration: false,
            outDir: "./dist",
            baseUrl: "./",
            paths: {
                "*": ["node_modules/*"]
            }
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist", "test", "**/*spec.ts"]
    };
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log(`Updated tsconfig.json for ${serviceDir}`);
};


// Execute command for a sensureServiceTsConfigpecific service
const executeForService = (service, command, options = {}) => {
    try {
        console.log(`Executing ${command} for ${service}...`);
        execSync(command, {
            stdio: 'inherit',
            cwd: options.cwd || path.join(__dirname, '..', 'services', service),
            ...options
        });
    } catch (error) {
        console.error(`Error executing ${command} for ${service}:`, error.message);
        process.exit(1);
    }
};

// Ensure root tsconfig.json exists
const ensureRootTsConfig = () => {
    const rootTsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
    if (!fs.existsSync(rootTsConfigPath)) {
        const rootTsConfig = {
            compilerOptions: {
                module: "commonjs",
                declaration: true,
                removeComments: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                allowSyntheticDefaultImports: true,
                target: "ES2021",
                sourceMap: true,
                outDir: "./dist",
                baseUrl: "./",
                incremental: true,
                skipLibCheck: true,
                strictNullChecks: false,
                noImplicitAny: false,
                strictBindCallApply: false,
                forceConsistentCasingInFileNames: false,
                noFallthroughCasesInSwitch: false
            }
        };
        fs.writeFileSync(rootTsConfigPath, JSON.stringify(rootTsConfig, null, 2));
        console.log('Generated root tsconfig.json');
    }
};

const command = process.argv[2];
const services = getServiceDirs();


// Ensure necessary configuration files exist
ensureRootTsConfig();

services.forEach(service => {
    ensureServiceStructure(service);
    updateServiceTsConfig(service);
});

updateNestConfig();

switch (command) {
    case 'install':
        // First install root dependencies
        console.log('Installing root dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        // Then install service dependencies
        services.forEach(service => {
            executeForService(service, 'npm install');
        });
        break;

    case 'build':
        // Execute builds from the root directory since nest-cli.json is there
        services.forEach(service => {
            const projectName = getProjectName(service);
            executeForService(
                service,
                `nest build ${projectName}`,
                { cwd: path.join(__dirname, '..') }
            );
        });
        break;

    case 'start':
        const mode = process.argv[3] || 'prod';
        const serviceToStart = process.argv[4];

        if (serviceToStart) {
            const projectName = getProjectName(serviceToStart);
            const command = mode === 'dev'
                ? `nest start ${projectName} --watch`
                : `nest start ${projectName}`;
            executeForService(serviceToStart, command, { cwd: path.join(__dirname, '..') });
        } else {
            services.forEach(service => {
                const projectName = getProjectName(service);
                const command = mode === 'dev'
                    ? `nest start ${projectName} --watch`
                    : `nest start ${projectName}`;
                executeForService(service, command, { cwd: path.join(__dirname, '..') });
            });
        }
        break;

    default:
        console.error('Unknown command. Use: install, build, or start');
        process.exit(1);
}