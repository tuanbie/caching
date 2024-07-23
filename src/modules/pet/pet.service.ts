import { Pets } from '@common/models/entities/pet.entity';
import { PromptTemplate } from '@langchain/core/prompts';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { chatMascotPrompt } from './prompt/chat-mascot.prompt';
import { ICurrentUser } from '@common/types/current-user.type';
import { BufferMemory } from 'langchain/memory';
import { LLMChain } from 'langchain/chains';
import { OpenAI } from '@langchain/openai';
import { appSettings } from '@common/configs/appSetting';
import { Caching } from '@common/providers/caching/caching';
import { ChatMascotDto } from './dtos/chat-mascot.dto';
import { GptService } from '@modules/gpt/gpt.service';
import { MyPet } from '@common/models/entities/my-pet.entity';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';

@Injectable()
export class PetService {
  private llm: OpenAI = new OpenAI({
    openAIApiKey: appSettings.openAI.key6,
    modelName: 'gpt-4o',
    temperature: 0.7,
    verbose: false,
  });

  constructor(
    @InjectModel(Pets.name) private petModel: Model<Pets>,
    @InjectModel(MyPet.name) private myPetModel: Model<MyPet>,
    private caching: Caching,
    private gptService: GptService,
  ) {}

  async getAllPets() {
    return await this.petModel.find();
  }

  async getAllMyPets(user: ICurrentUser) {
    const myPets = await this.myPetModel
      .find({ student: user._id })
      .populate('pet');

    return myPets;
  }

  async chatMascot(myPetId: string, user: ICurrentUser, body: ChatMascotDto) {
    const { question } = body;
    const myPet = await this.myPetModel.findById(myPetId).populate('pet');

    if (!myPet) throw new BadRequestException('Pet not found');

    const pet = myPet.pet as Pets;

    const formatPrompt = await PromptTemplate.fromTemplate(
      chatMascotPrompt,
    ).format({
      petName: pet.name,
      username: user.username,
      affectionLevel: myPet.affectionPoint,
      petDescription: pet.description,
    });

    const memory = new BufferMemory({ memoryKey: 'chat_history' });
    let storeMemory = [];
    const key = `memory:${user._id.toString()}:${myPet._id.toString()}`;
    storeMemory = await this.caching.getValue(key);
    if (storeMemory)
      storeMemory.forEach((m) => {
        memory.saveContext({ input: m.question }, { output: m.answer });
      });
    else storeMemory = [];

    const prompt = new PromptTemplate({
      template: formatPrompt,
      inputVariables: ['chat_history', 'human_input'],
    });

    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      memory,
    });

    const answer = await chain.predict({
      human_input: question,
    });

    const audioUrl = await this.gptService.textToSpeech(answer);

    storeMemory.push({ question, answer });
    this.caching.setValue(key, storeMemory, 20 * 60 * 1000);

    return { answer, audioUrl };
  }
}
