const esbuild = require('esbuild');
const {nodeExternalsPlugin} = require('esbuild-node-externals');

const {dependencies = [], peerDependencies = []} = require('../package.json');

esbuild
    .build({
        entryPoints: ['src/index.ts'],
        outfile: 'lib/cjs/index.js',
        bundle: true,
        format: 'cjs',
        minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node14',
        external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
        plugins: [nodeExternalsPlugin()],
    })
    .catch(() => process.exit(1));
