import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

const sendMock = jest.fn();

S3Client.prototype.send = sendMock;

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    sendMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return status up if the bucket is accessible', async () => {
      sendMock.mockResolvedValueOnce({});

      const result = await service.checkHealth();

      expect(result).toEqual({ status: 'up' });
      expect(sendMock).toHaveBeenCalledWith(expect.any(ListObjectsCommand));
    });

    it('should return status down if the bucket is not accessible', async () => {
      sendMock.mockRejectedValueOnce(new Error('Bucket not found'));

      const result = await service.checkHealth();

      expect(result).toEqual({ status: 'down', message: 'Bucket not found' });
    });
  });

  describe('addObject', () => {
    it('should add an object to the bucket', async () => {
      sendMock
        .mockResolvedValueOnce({ Contents: [] }) // No existing object
        .mockResolvedValueOnce({}); // Successful PutObject

      const key = await service.addObject('test', 'txt', Buffer.from('data'));

      expect(key).toBe('test.txt');
      expect(sendMock).toHaveBeenCalledTimes(2);
      expect(sendMock).toHaveBeenNthCalledWith(
        1,
        expect.any(ListObjectsV2Command),
      );
      expect(sendMock).toHaveBeenNthCalledWith(2, expect.any(PutObjectCommand));
    });

    it('should throw an error if the key already exists', async () => {
      sendMock.mockResolvedValueOnce({ Contents: [{ Key: 'test.txt' }] });

      await expect(
        service.addObject('test', 'txt', Buffer.from('data')),
      ).rejects.toThrowError('Key "test.txt" already exists');
    });
  });

  describe('getObject', () => {
    it('should return the object if the key exists', async () => {
      sendMock
        .mockResolvedValueOnce({ Contents: [{ Key: 'test.txt' }] }) // Key exists
        .mockResolvedValueOnce({ Body: 'file content' }); // GetObject

      const body = await service.getObject('test.txt');

      expect(body).toBe('file content');
      expect(sendMock).toHaveBeenCalledTimes(2);
      expect(sendMock).toHaveBeenNthCalledWith(
        1,
        expect.any(ListObjectsCommand),
      );
      expect(sendMock).toHaveBeenNthCalledWith(2, expect.any(GetObjectCommand));
    });

    it('should throw an error if the key does not exist', async () => {
      sendMock.mockResolvedValueOnce({ Contents: [] }); // Key does not exist

      await expect(service.getObject('test.txt')).rejects.toThrowError(
        'Key does not exist',
      );
    });
  });

  describe('updateObject', () => {
    it('should update the object if the key exists', async () => {
      sendMock
        .mockResolvedValueOnce({ Contents: [{ Key: 'test.txt' }] }) // Key exists
        .mockResolvedValueOnce({}); // PutObject

      await service.updateObject('test.txt', Buffer.from('updated content'));

      expect(sendMock).toHaveBeenCalledTimes(2);
      expect(sendMock).toHaveBeenNthCalledWith(
        1,
        expect.any(ListObjectsCommand),
      );
      expect(sendMock).toHaveBeenNthCalledWith(2, expect.any(PutObjectCommand));
    });

    it('should throw an error if the key does not exist', async () => {
      sendMock.mockResolvedValueOnce({ Contents: [] }); // Key does not exist

      await expect(
        service.updateObject('test.txt', Buffer.from('updated content')),
      ).rejects.toThrowError('Key does not exist');
    });
  });

  describe('deleteObject', () => {
    it('should delete the object if the key exists', async () => {
      sendMock
        .mockResolvedValueOnce({ Contents: [{ Key: 'test.txt' }] }) // Key exists
        .mockResolvedValueOnce({}); // DeleteObject

      await service.deleteObject('test.txt');

      expect(sendMock).toHaveBeenCalledTimes(2);
      expect(sendMock).toHaveBeenNthCalledWith(
        1,
        expect.any(ListObjectsCommand),
      );
      expect(sendMock).toHaveBeenNthCalledWith(
        2,
        expect.any(DeleteObjectCommand),
      );
    });

    it('should throw an error if the key does not exist', async () => {
      sendMock.mockResolvedValueOnce({ Contents: [] }); // Key does not exist

      await expect(service.deleteObject('test.txt')).rejects.toThrowError(
        'Key does not exist',
      );
    });
  });
});
