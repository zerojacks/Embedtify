import { TestUseCase, TestStep } from '../types/scheme';
import { XMLParser } from 'fast-xml-parser';

self.onmessage = (event) => {
    const { content, fileId } = event.data;
    try {
        const parsedData = parseTSLFile(content, fileId);
        self.postMessage({ success: true, data: parsedData, fileId });
    } catch (error: any) {
        self.postMessage({ success: false, error: error.message, fileId });
    }
};

const parseTSLFile = (content: string, fileId: string): TestUseCase[] => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
    });
    const xmlDoc = parser.parse(content);

    const useCases: TestUseCase[] = [];
    const usecaseElements = Array.isArray(xmlDoc.scheme.usecase) ? xmlDoc.scheme.usecase : [xmlDoc.scheme.usecase];

    usecaseElements.forEach((usecaseElement: any, i: number) => {
        const useCaseName = usecaseElement['@_name'] || `UseCase ${i + 1}`;

        const steps: TestStep[] = [];
        const stepElements = Array.isArray(usecaseElement.step) ? usecaseElement.step : [usecaseElement.step];

        stepElements.forEach((stepElement: any, j: number) => {
            const stepName = stepElement['@_name'] || `Step ${j + 1}`;
            const stepType = stepElement['@_type'] || undefined;
            const stepPort = stepElement['@_port'] || undefined;
            const content = stepElement.content || '';
            const result = stepElement.result || '';

            steps.push({
                id: `${fileId}-${i}-${j}`,
                name: stepName,
                content,
                result,
                type: stepType,
                port: stepPort,
                selected: true,
            });
        });

        useCases.push({
            id: `${fileId}-${i}`,
            name: useCaseName,
            steps,
            selected: true,
        });
    });

    return useCases;
}; 