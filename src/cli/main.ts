import { buildProgram } from "./program.js";

export const main = async (argv: string[] = process.argv): Promise<void> => {
	await buildProgram().parseAsync(argv);
};

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`${message}\n`);
	process.exitCode = 1;
});