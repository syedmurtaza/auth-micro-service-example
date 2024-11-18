// scripts/manage-services.js
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

// Check if service structure needs update
const checkServiceStructure = (serviceDir) => {
    const servicePath = path.join(__dirname, '..', 'services', serviceDir);
    const srcPath = path.join(servicePath, 'src');

    // Only create src directory and move files if src doesn't exist and there are .ts files in root
    if (!fs.existsSync(srcPath)) {
        const tsFilesInRoot = fs.readdirSync(servicePath)
            .filter(file => file.endsWith('.ts'));

        if (tsFilesInRoot.length > 0) {
            fs.mkdirSync(srcPath, { recursive: true });
            console.log(`Created src directory for ${serviceDir}`);

            // Move all .ts files to src directory
            tsFilesInRoot.forEach(file => {
                const oldPath = path.join(servicePath, file);
                const newPath = path.join(srcPath, file);
                fs.renameSync(oldPath, newPath);
                console.log(`Moved ${file} to src directory in ${serviceDir}`);
            });
            return true;
        }
    }
    return false;
};

// Check if nest-cli.json needs update
const checkNestConfig = () => {
    const services = getServiceDirs();
    const configPath = path.join(__dirname, '..', 'nest-cli.json');

    let existingConfig = {};
    let needsUpdate = false;

    // Read existing config if it exists
    if (fs.existsSync(configPath)) {
        existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
        needsUpdate = true;
    }

    const newConfig = {
        "$schema": "https://json.schemastore.org/nest-cli",
        "collection": "@nestjs/schematics",
        "sourceRoot": "services",
        "monorepo": true,
        "root": "services",
        "projects": { ...(existingConfig.projects || {}) }
    };

    // Check for new or removed services
    services.forEach(serviceDir => {
        const projectName = getProjectName(serviceDir);
        if (!newConfig.projects[projectName]) {
            needsUpdate = true;
            newConfig.projects[projectName] = {
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
        }
    });

    // Remove projects that no longer exist
    Object.keys(newConfig.projects).forEach(projectName => {
        const serviceDir = `${projectName}-service`;
        if (!services.includes(serviceDir)) {
            needsUpdate = true;
            delete newConfig.projects[projectName];
        }
    });

    if (needsUpdate) {
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        console.log('Updated nest-cli.json with changes');
    }

    return needsUpdate;
};

// Create tsconfig.json only if it doesn't exist
const ensureServiceTsConfig = (serviceDir) => {
    const tsconfigPath = path.join(__dirname, '..', 'services', serviceDir, 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
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
        console.log(`Created tsconfig.json for ${serviceDir}`);
        return true;
    }
    return false;
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
                target: "es2017",
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
        console.log('Created root tsconfig.json');
        return true;
    }
    return false;
};

// Execute command for a specific service
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

const command = process.argv[2];
const services = getServiceDirs();

// Check and update configurations only if needed
let configChanged = false;
configChanged = ensureRootTsConfig() || configChanged;
configChanged = checkNestConfig() || configChanged;

services.forEach(service => {
    configChanged = checkServiceStructure(service) || configChanged;
    configChanged = ensureServiceTsConfig(service) || configChanged;
});

if (configChanged) {
    console.log('Configuration changes were made. Please review the changes if needed.');
}

switch (command) {
    case 'install':
        console.log('Installing root dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        services.forEach(service => {
            executeForService(service, 'npm install');
        });
        break;

    case 'build':
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